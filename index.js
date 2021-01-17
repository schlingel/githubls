const fetch = require('node-fetch');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

function clearToken(token) {
    const clearTokenMap = {
        '!' : '%21',
        '#' : '%23',
        '$' : '%24',
        '&' : '%26',
        '\'' : '%27',
        '(' : '%28',
        ')' : '%29',
        '*' : '%2A',
        '+' : '%2B',
        ',' : '%2C',
        '/' : '%2F',
        ':' : '%3A',
        ';' : '%3B',
        '=' : '%3D',
        '?' : '%3F',
        '@' : '%40',
        '[' : '%5B',
        ']' : '%5D'
    };
    let result = '';

    for (let i = 0; i < token.length; i++) {
        const cur = token.charAt(i);
        const replacement = clearTokenMap[cur];

        if (!!replacement) {
            result += replacement;
        } else {
            result += cur;
        }
    }

    return result;
}

function listRepositories(creds) {
    const token = Buffer.from(`${creds.user}:${creds.token}`).toString('base64');
    const authHeader = `Basic ${token}`;

    fetch('https://api.github.com/user/repos', {
        method: 'GET',
        headers: {
            'Content-Type' : 'application/json',
            'Authorization': authHeader
        }
    })
    .then(res => res.json())
    .then(repos => {
        if (!!repos) {
            repos.map(repo => repo.clone_url)
                .map(repoUrl => {
                    if (creds.password) {
                        const authUrlPart = (`${clearToken(creds.user)}:${clearToken(creds.password)}@`);
                        return ('https://' + authUrlPart + repoUrl.substr(8));
                    } else {
                        return repoUrl;
                    }
                })
                .forEach(repoUrl => console.log(repoUrl));
        } else {
            console.error('ERROR: Could not read repositories');
        }
    });
}

const argv = yargs(hideBin(process.argv))
    .option('user', {
        alias: 'u',
        describe: 'Github user name'
    })
    .option('token', {
        alias: 't',
        describe: 'Access Token of Github required for REST API'
    })
    .option('password', {
        alias: 'p',
        describe: 'Password of Github user'
    })
    .demandOption([ 'user', 'token' ], 'User and token are required')
    .help()
    .argv;

listRepositories(argv);
