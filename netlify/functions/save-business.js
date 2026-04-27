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

    console.log('GITHUB_TOKEN set:', token ? 'YES (' + token.substring(0, 7) + '...)' : 'NO!!!');
    console.log('GITHUB_REPO set:', repo ? 'YES (' + repo + ')' : 'NO!!!');

    if (!token || !repo) {
      console.error('ERROR: Missing environment variables');
      return { statusCode: 500, body: JSON.stringify({ error: 'Server not configured.' }) };
    }

    const filePath = 'src/data/businesses.js'; 
    const branchesToSync = ['main', 'test'];

    for (let i = 0; i < branchesToSync.length; i++) {
      const branch = branchesToSync[i];
      console.log('\n--- Syncing to branch: ' + branch + ' ---');
      
      const apiPath = '/repos/' + repo + '/contents/' + filePath + '?ref=' + branch;

      // 1. Get current file
      const fileRes = await githubRequest(apiPath, 'GET', null, token);

      if (!fileRes.sha) {
        console.error('ERROR: Could not find file on ' + branch + '. Response:', JSON.stringify(fileRes).substring(0, 300));
        continue; // Skip to next branch instead of crashing
      }

      const currentContent = Buffer.from(fileRes.content, 'base64').toString('utf8');
      const sha = fileRes.sha;
      console.log('File found on ' + branch + '! Size:', currentContent.length, 'characters.');

      // 2. Skip if business already exists on this branch
      if (currentContent.indexOf("'" + slug + "'") !== -1) {
        console.log('Slug already exists on ' + branch + '. Skipping.');
        continue;
      }

      // 3. Insert new config
      const insertionPoint = currentContent.lastIndexOf('},');
      if (insertionPoint === -1) {
        console.error('ERROR: Could not find insertion point on ' + branch);
        continue;
      }

      const newContent = currentContent.slice(0, insertionPoint + 2) + 
        '\n\n  // Added by onboarding ' + new Date().toISOString() + '\n' +
        config + '\n' +
        currentContent.slice(insertionPoint + 2);

      // 4. Commit
      console.log('Committing to ' + branch + '...');
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
        console.error('ERROR: Commit failed on ' + branch + '. Response:', JSON.stringify(commitRes).substring(0, 500));
      } else {
        console.log('SUCCESS on ' + branch + '!');
      }
    }

    console.log('\n=== ALL BRANCHES SYNCED ===');
    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, slug: slug, message: 'Business added to all branches!' })
    };

  } catch (err) {
    console.error('=== UNCAUGHT ERROR ===');
    console.error(err.message);
    console.error(err.stack);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};