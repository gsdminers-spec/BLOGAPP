import { NextResponse } from 'next/server';

export async function POST() {
    try {
        const pat = process.env.GITHUB_PAT;
        const owner = process.env.GITHUB_REPO_OWNER;
        const repo = process.env.GITHUB_REPO_NAME;

        if (!pat || !owner || !repo) {
            console.error('Missing GitHub configuration');
            return NextResponse.json({ success: false, error: 'GitHub configuration missing' }, { status: 500 });
        }

        // https://docs.github.com/en/rest/actions/workflows?apiVersion=2022-11-28#create-a-workflow-dispatch-event
        // We will trigger the 'deploy.yml' workflow. 
        // Note: The workflow file name must match exactly what is in the repository.
        const workflowId = 'deploy.yml';
        const ref = 'main'; // The branch to run the workflow on

        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflowId}/dispatches`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${pat}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ref: ref,
            }),
        });

        if (response.status === 204) {
            return NextResponse.json({ success: true, message: 'Deployment triggered successfully' });
        } else {
            const errorText = await response.text();
            console.error('GitHub API Error:', response.status, errorText);
            return NextResponse.json({ success: false, error: `GitHub API failed: ${response.status} ${errorText}` }, { status: 500 });
        }

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Deploy API Error:', errorMessage);
        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
    }
}
