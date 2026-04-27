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
        const rawData = Buffer.concat(chunks).toString();
        console.log('GitHub Response Status:', res.statusCode);
        try {
          resolve(JSON.parse(rawData));
        } catch (e) {
          console.error('GitHub Response Parse Error:', rawData.substring(0, 200));
          reject(new Error('Invalid GitHub response'));
        }
      });
    });

    req.on('error', function(err) {
      console.error('GitHub Request Network Error:', err.message);
      reject(err);
    });
    
    if (data) req.write(data);
    req.end();
  });
}

exports.handler = async function(event) {
  console.log('=== SAVE-BUSINESS FUNCTION STARTED ===');
  
  try {
    const { slug, config } = JSON.parse(event.body);
    console.log('Received Slug:', slug);
    console.log('Config Length:', config ? config.length : 0, 'characters');

    if (!slug || !config) {
      console.error('ERROR: Missing slug or config');
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing slug or config' }) };
    }

    const token = process.env.GITHUB_TOKEN;
    const repo = process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_BRANCH || 'main';

    // DEBUG: Check if env vars exist
    console.log('GITHUB_TOKEN set:', token ? 'YES (' + token.substring(0, 7) + '...)' : 'NO!!!');
    console.log('GITHUB_REPO set:', repo ? 'YES (' + repo + ')' : 'NO!!!');
    console.log('GITHUB_BRANCH set:', branch ? 'YES (' + branch + ')' : 'NO!!!');

    if (!token || !repo) {
      console.error('ERROR: Missing environment variables');
      return { statusCode: 500, body: JSON.stringify({ error: 'Server not configured. Check GITHUB_TOKEN and GITHUB_REPO in Netlify Env Vars.' }) };
    }

    // IMPORTANT: Make sure this path exactly matches where your file lives in GitHub!
    const filePath = 'src/data/businesses.js'; 
    const apiPath = '/repos/' + repo + '/contents/' + filePath + '?ref=' + branch;
    console.log('Fetching file from GitHub path:', apiPath);

    // 1. Get current file
    const fileRes = await githubRequest(apiPath, 'GET', null, token);

    if (!fileRes.sha) {
      console.error('ERROR: Could not find file. GitHub responded with:', JSON.stringify(fileRes).substring(0, 300));
      return { statusCode: 500, body: JSON.stringify({ error: 'Could not find ' + filePath + '. Check GITHUB_REPO and file path in function code.' }) };
    }

    const currentContent = Buffer.from(fileRes.content, 'base64').toString('utf8');
    const sha = fileRes.sha;
    console.log('File found! Current size:', currentContent.length, 'characters. SHA:', sha);

    // 2. Check for duplicate
    if (currentContent.indexOf("'" + slug + "'") !== -1) {
      console.error('ERROR: Slug already exists!');
      return { statusCode: 409, body: JSON.stringify({ error: 'Business slug already exists' }) };
    }

    // 3. Insert new config
    const insertionPoint = currentContent.lastIndexOf('},');
    if (insertionPoint === -1) {
      console.error('ERROR: Could not find insertion point `},` in file');
      return { statusCode: 500, body: JSON.stringify({ error: 'Could not find insertion point in file' }) };
    }

    const newContent = currentContent.slice(0, insertionPoint + 2) + 
      '\n\n  // Added by onboarding ' + new Date().toISOString() + '\n' +
      config + '\n' +
      currentContent.slice(insertionPoint + 2);

    console.log('New file size:', newContent.length, 'characters');
    console.log('Base64 size:', Buffer.from(newContent).toString('base64').length, 'characters');

    // 4. Commit
    console.log('Committing to GitHub...');
    const commitRes = await githubRequest(
      '/repos/' + repo + '/contents/' + filePath,
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
      console.error('ERROR: Git commit failed. Response:', JSON.stringify(commitRes).substring(0, 500));
      return { statusCode: 500, body: JSON.stringify({ error: 'Git commit failed', details: commitRes.message }) };
    }

    console.log('=== SUCCESS ===');
    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, slug: slug, message: 'Business added!' })
    };

  } catch (err) {
    console.error('=== UNCAUGHT ERROR ===');
    console.error(err.message);
    console.error(err.stack);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};