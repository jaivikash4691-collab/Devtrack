const axios = require('axios');

// In-memory cache: { [repoKey]: { data, timestamp } }
const cache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Extracts owner and repo from GitHub URL or shorthand
 * e.g. "https://github.com/facebook/react" -> { owner: "facebook", repo: "react" }
 */
const parseGitHubUrl = (input) => {
  if (!input || typeof input !== 'string') return null;
  const cleaned = input.trim().replace(/\/+$/, '');

  const match = cleaned.match(
    /(?:https?:\/\/github\.com\/|^)([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)/
  );

  if (match) {
    return {
      owner: match[1],
      repo: match[2].replace(/\.git$/, ''),
    };
  }
  return null;
};

/**
 * Fetches repository statistics, recent commits, and contributors from GitHub API
 */
const fetchGitHubStats = async (githubUrl) => {
  const parsed = parseGitHubUrl(githubUrl);
  if (!parsed) {
    throw new Error('Invalid GitHub repository URL or format. Example: https://github.com/owner/repo');
  }

  const { owner, repo } = parsed;
  const cacheKey = `${owner}/${repo}`.toLowerCase();

  // Check cache
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return { ...cached.data, cached: true };
  }

  const headers = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'DevTrack-MERN-App',
  };

  if (process.env.GITHUB_TOKEN && process.env.GITHUB_TOKEN.trim() !== '') {
    headers.Authorization = `token ${process.env.GITHUB_TOKEN.trim()}`;
  }

  try {
    // 1. Fetch Repo info
    const repoRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
      headers,
      timeout: 8000,
    });

    const repoData = repoRes.data;

    // 2. Fetch Recent Commits (last 15)
    let recentCommits = [];
    try {
      const commitsRes = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/commits?per_page=15`,
        { headers, timeout: 6000 }
      );
      recentCommits = commitsRes.data.map((c) => ({
        sha: c.sha.substring(0, 7),
        message: c.commit.message.split('\n')[0],
        author: c.commit.author.name,
        authorAvatar: c.author ? c.author.avatar_url : null,
        date: c.commit.author.date,
        url: c.html_url,
      }));
    } catch (err) {
      console.warn(`[GitHub API] Failed to fetch commits for ${cacheKey}: ${err.message}`);
    }

    // 3. Fetch Contributors (top 10)
    let contributors = [];
    try {
      const contribRes = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/contributors?per_page=10`,
        { headers, timeout: 6000 }
      );
      if (Array.isArray(contribRes.data)) {
        contributors = contribRes.data.map((c) => ({
          username: c.login,
          avatarUrl: c.avatar_url,
          contributions: c.contributions,
          profileUrl: c.html_url,
        }));
      }
    } catch (err) {
      console.warn(`[GitHub API] Failed to fetch contributors for ${cacheKey}: ${err.message}`);
    }

    const payload = {
      owner,
      repo,
      fullName: repoData.full_name,
      description: repoData.description || 'No description provided.',
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      openIssues: repoData.open_issues_count,
      watchers: repoData.watchers_count,
      language: repoData.language,
      defaultBranch: repoData.default_branch,
      updatedAt: repoData.updated_at,
      pushedAt: repoData.pushed_at,
      htmlUrl: repoData.html_url,
      recentCommits,
      contributors,
      syncedAt: new Date().toISOString(),
    };

    cache.set(cacheKey, { data: payload, timestamp: Date.now() });

    return { ...payload, cached: false };
  } catch (error) {
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error(`GitHub repository "${owner}/${repo}" was not found or is private.`);
      }
      if (error.response.status === 403) {
        throw new Error('GitHub API rate limit exceeded. Please try again later or add a GITHUB_TOKEN.');
      }
    }
    throw new Error(`Failed to fetch GitHub repository data: ${error.message}`);
  }
};

module.exports = {
  parseGitHubUrl,
  fetchGitHubStats,
};
