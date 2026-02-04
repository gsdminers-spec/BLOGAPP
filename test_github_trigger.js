// Test GitHub Workflow Dispatch Trigger
// Run: node test_github_trigger.js

const GITHUB_PAT = process.env.GITHUB_PAT;
const REPO_OWNER = process.env.GITHUB_REPO_OWNER || 'gsdminers-spec';
const REPO_NAME = process.env.GITHUB_REPO_NAME || 'asicrepair.in';
const WORKFLOW_FILE = 'deploy.yml';

async function testTrigger() {
    console.log('🔧 Testing GitHub Workflow Dispatch...');
    console.log(`   Repo: ${REPO_OWNER}/${REPO_NAME}`);
    console.log(`   Workflow: ${WORKFLOW_FILE}`);
    console.log(`   PAT: ${GITHUB_PAT.substring(0, 10)}...`);
    console.log('');

    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/${WORKFLOW_FILE}/dispatches`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': `Bearer ${GITHUB_PAT}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ref: 'main',
            }),
        });

        if (response.ok) {
            console.log('✅ SUCCESS: Workflow dispatch triggered!');
            console.log('   Status:', response.status);
            console.log('   Check GitHub Actions tab to confirm.');
        } else {
            const errorText = await response.text();
            console.log('❌ FAILED: Could not trigger workflow.');
            console.log('   Status:', response.status);
            console.log('   Error:', errorText);

            if (response.status === 403) {
                console.log('');
                console.log('⚠️  HINT: 403 usually means:');
                console.log('   1. PAT is missing "workflow" scope');
                console.log('   2. PAT is expired');
                console.log('   3. PAT does not have access to this repo');
                console.log('');
                console.log('🔧 FIX: Go to https://github.com/settings/tokens');
                console.log('   Create a new token with "repo" and "workflow" scopes.');
            }

            if (response.status === 404) {
                console.log('');
                console.log('⚠️  HINT: 404 usually means:');
                console.log('   1. Workflow file "deploy.yml" does not exist');
                console.log('   2. Repository not found or PAT has no access');
            }
        }
    } catch (error) {
        console.log('❌ EXCEPTION:', error.message);
    }
}

testTrigger();
