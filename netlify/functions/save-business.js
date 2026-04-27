// /.netlify/functions/save-business.js

const https = require('https');

function githubRequest(path, method, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const options = {
      hostname: 'api.github.com',
      path: path,
      method: method,
      headers: {
        'Authorization': 'Bearer ' + token,
        'User-Agent': 'Netlify-Function',
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    const req = https.request(options, function(res) {
      let chunks = [];
      res.on('data', function(chunk) { chunks.push(chunk); });
      res.on('end', function() {
        try {
          resolve(JSON.parse(Buffer.concat(chunks).toString()));
        } catch (e) {
          reject(new Error('Invalid GitHub response'));
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'POST only' }) };
  }

  try {
    const { slug, config } = JSON.parse(event.body);

    if (!slug || !config) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing slug or config' }) };
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid slug format' }) };
    }

    const token = process.env.GITHUB_TOKEN;
    const repo = process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_BRANCH || 'main';

    if (!token || !repo) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Server not configured' }) };
    }

    // 1. Get the current file SHA
    const fileRes = await githubRequest(
      '/repos/' + repo + '/contents/src/data/businesses.js?ref=' + branch,
      'GET',
      null,
      token
    );

    if (!fileRes.sha) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Could not find businesses.js' }) };
    }

    const currentContent = Buffer.from(fileRes.content, 'base64').toString('utf8');
    const sha = fileRes.sha;

    // 2. Check if slug already exists
    if (currentContent.indexOf("'" + slug + "'") !== -1) {
      return { statusCode: 409, body: JSON.stringify({ error: 'Business slug already exists' }) };
    }

    // 3. Insert the new config before the closing };
    // Find the last `},` before the final `};`
    const insertionPoint = currentContent.lastIndexOf('},');
    
    if (insertionPoint === -1) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Could not find insertion point in file' }) };
    }

    // Insert after the last `},`
    const newContent = currentContent.slice(0, insertionPoint + 2) + 
      '\n\n  // Added by onboarding ' + new Date().toISOString() + '\n' +
      config + '\n' +
      currentContent.slice(insertionPoint + 2);

    // 4. Commit the change
    const commitRes = await githubRequest(
      '/repos/' + repo + '/contents/src/data/businesses.js',
      'PUT',
      {
        message: 'Add new business: ' + slug,
        content: Buffer.from(newContent).toString('base64'),
        sha: sha,
        branch: branch
      },
      token
    );

    if (!commitRes.commit) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Git commit failed', details: commitRes }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        ok: true, 
        slug: slug,
        message: 'Business added. Site will rebuild in ~60 seconds.'
      })
    };

  } catch (err) {
    console.error('Save business error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};