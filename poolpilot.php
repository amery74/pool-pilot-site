<?php
namespace Grav\Theme;

use Grav\Common\Theme;
use RocketTheme\Toolbox\Event\Event;

class Poolpilot extends Theme
{
    public static function getSubscribedEvents(): array
    {
        return [
            'onThemeInitialized' => ['onThemeInitialized', 0],
            'onTwigSiteVariables' => ['onTwigSiteVariables', 0],
        ];
    }

    public function onThemeInitialized(): void
    {
        $this->enable([
            'onTwigSiteVariables' => ['onTwigSiteVariables', 0],
        ]);
    }

    public function onTwigSiteVariables(Event $event): void
    {
        $route = (string) $this->grav['uri']->route();
        if ($route !== '/roadmap' && $route !== '/roadmap/') {
            return;
        }

        $this->grav['twig']->twig_vars['poolpilot_roadmap'] = $this->loadRoadmap();
    }

    private function loadRoadmap(): array
    {
        $defaults = [
            'enabled' => true,
            'owner' => 'amery74',
            'repositories' => [
                ['name' => 'ha-poolpilot', 'label' => 'Intégration', 'type' => 'integration'],
                ['name' => 'pool-pilot-dashboard', 'label' => 'Dashboard', 'type' => 'dashboard'],
            ],
            'cache_ttl' => 21600,
            'request_timeout' => 8,
            'token' => '',
            'labels' => [
                'done' => ['roadmap: disponible', 'roadmap: terminé', 'status: done'],
                'progress' => ['roadmap: en cours', 'status: in progress'],
                'planned' => ['roadmap: prévu', 'status: planned'],
                'study' => ["roadmap: à l'étude", 'roadmap: a etudier', 'status: idea'],
            ],
        ];

        $themeConfig = (array) $this->grav['config']->get('themes.poolpilot.roadmap', []);
        $localConfig = (array) $this->config->get('roadmap', []);
        $config = array_replace_recursive($defaults, $themeConfig, $localConfig);

        if (empty($config['repositories']) || !is_array($config['repositories'])) {
            $config['repositories'] = $defaults['repositories'];
        }

        $enabled = (bool) ($config['enabled'] ?? true);
        $cacheFile = $this->grav['locator']->findResource(
            'user://data/poolpilot-roadmap-cache.json',
            true,
            true
        );

        if (!$enabled) {
            return $this->emptyRoadmap('La synchronisation GitHub est désactivée.');
        }

        $ttl = max(300, (int) ($config['cache_ttl'] ?? 21600));
        $cached = $this->readCache($cacheFile);

        if ($cached && isset($cached['generated_at'])) {
            $age = time() - (int) $cached['generated_at'];
            if ($age >= 0 && $age < $ttl) {
                $cached['cache_status'] = 'fresh';
                return $cached;
            }
        }

        try {
            $fresh = $this->fetchRoadmap($config);
            $fresh['cache_status'] = 'refreshed';
            $this->writeCache($cacheFile, $fresh);
            return $fresh;
        } catch (\Throwable $exception) {
            if ($cached) {
                $cached['cache_status'] = 'stale';
                $cached['warning'] = 'GitHub est temporairement indisponible. La dernière synchronisation connue est affichée.';
                return $cached;
            }

            return $this->emptyRoadmap(
                'Impossible de synchroniser GitHub pour le moment.',
                $exception->getMessage()
            );
        }
    }

    private function fetchRoadmap(array $config): array
    {
        $owner = trim((string) ($config['owner'] ?? 'amery74'));
        $repositories = (array) ($config['repositories'] ?? []);
        $labelsConfig = (array) ($config['labels'] ?? []);

        if ($owner === '') {
            $owner = 'amery74';
        }
        if (!$repositories) {
            throw new \RuntimeException('Aucun dépôt GitHub n’est configuré pour la roadmap.');
        }
        $groups = [
            'done' => [],
            'progress' => [],
            'planned' => [],
            'study' => [],
            'other' => [],
        ];
        $releases = [];

        foreach ($repositories as $repository) {
            $repoName = trim((string) ($repository['name'] ?? ''));
            if ($repoName === '') {
                continue;
            }

            $repoLabel = (string) ($repository['label'] ?? $repoName);
            $repoType = (string) ($repository['type'] ?? 'repository');

            $issuesUrl = sprintf(
                'https://api.github.com/repos/%s/%s/issues?state=all&per_page=100&sort=updated&direction=desc',
                rawurlencode($owner),
                rawurlencode($repoName)
            );
            $issues = $this->githubRequest($issuesUrl, $config);

            foreach ($issues as $issue) {
                if (isset($issue['pull_request'])) {
                    continue;
                }

                $labels = array_map(
                    static fn(array $label): string => mb_strtolower(trim((string) ($label['name'] ?? ''))),
                    (array) ($issue['labels'] ?? [])
                );

                $group = $this->resolveGroup(
                    (string) ($issue['state'] ?? 'open'),
                    $labels,
                    $labelsConfig
                );

                $groups[$group][] = [
                    'title' => (string) ($issue['title'] ?? ''),
                    'number' => (int) ($issue['number'] ?? 0),
                    'url' => (string) ($issue['html_url'] ?? ''),
                    'state' => (string) ($issue['state'] ?? 'open'),
                    'labels' => array_values(array_filter(array_map(
                        static fn(array $label): string => (string) ($label['name'] ?? ''),
                        (array) ($issue['labels'] ?? [])
                    ))),
                    'milestone' => isset($issue['milestone']['title'])
                        ? (string) $issue['milestone']['title']
                        : null,
                    'updated_at' => (string) ($issue['updated_at'] ?? ''),
                    'closed_at' => (string) ($issue['closed_at'] ?? ''),
                    'repository' => $repoName,
                    'repository_label' => $repoLabel,
                    'repository_type' => $repoType,
                ];
            }

            $releaseUrl = sprintf(
                'https://api.github.com/repos/%s/%s/releases/latest',
                rawurlencode($owner),
                rawurlencode($repoName)
            );

            try {
                $release = $this->githubRequest($releaseUrl, $config);
                $releaseBody = (string) ($release['body'] ?? '');

                $releases[] = [
                    'repository' => $repoName,
                    'repository_label' => $repoLabel,
                    'repository_type' => $repoType,
                    'name' => (string) ($release['name'] ?? $release['tag_name'] ?? ''),
                    'tag' => (string) ($release['tag_name'] ?? ''),
                    'url' => (string) ($release['html_url'] ?? ''),
                    'published_at' => (string) ($release['published_at'] ?? ''),
                    'body' => $releaseBody,
                    'body_excerpt' => $this->releaseExcerpt($releaseBody),
                    'fallback' => false,
                ];
            } catch (\Throwable $releaseException) {
                try {
                    $tagsUrl = sprintf(
                        'https://api.github.com/repos/%s/%s/tags?per_page=1',
                        rawurlencode($owner),
                        rawurlencode($repoName)
                    );
                    $tags = $this->githubRequest($tagsUrl, $config);
                    $latestTag = isset($tags[0]['name']) ? (string) $tags[0]['name'] : '';

                    $releases[] = [
                        'repository' => $repoName,
                        'repository_label' => $repoLabel,
                        'repository_type' => $repoType,
                        'name' => $latestTag !== '' ? $latestTag : 'Release indisponible',
                        'tag' => $latestTag,
                        'url' => sprintf('https://github.com/%s/%s/releases', $owner, $repoName),
                        'published_at' => '',
                        'body' => '',
                        'body_excerpt' => '',
                        'fallback' => true,
                    ];
                } catch (\Throwable $tagException) {
                    $releases[] = [
                        'repository' => $repoName,
                        'repository_label' => $repoLabel,
                        'repository_type' => $repoType,
                        'name' => 'Synchronisation indisponible',
                        'tag' => '',
                        'url' => sprintf('https://github.com/%s/%s/releases', $owner, $repoName),
                        'published_at' => '',
                        'body' => '',
                        'body_excerpt' => '',
                        'fallback' => true,
                    ];
                }
            }
        }

        foreach ($groups as &$items) {
            usort($items, static function (array $a, array $b): int {
                return strcmp((string) $b['updated_at'], (string) $a['updated_at']);
            });
        }
        unset($items);

        return [
            'ok' => true,
            'generated_at' => time(),
            'generated_iso' => gmdate('c'),
            'owner' => $owner,
            'groups' => $groups,
            'releases' => $releases,
            'warning' => null,
            'error_detail' => null,
        ];
    }

    private function releaseExcerpt(string $body, int $limit = 700): string
    {
        $text = trim($body);
        if ($text === '') {
            return '';
        }

        // Keep release notes readable without injecting raw GitHub HTML into the page.
        $text = preg_replace('/```.*?```/s', ' ', $text) ?? $text;
        $text = preg_replace('/`([^`]+)`/', '$1', $text) ?? $text;
        $text = preg_replace('/!\[[^\]]*\]\([^)]+\)/', ' ', $text) ?? $text;
        $text = preg_replace('/\[([^\]]+)\]\([^)]+\)/', '$1', $text) ?? $text;
        $text = preg_replace('/^\s{0,3}#{1,6}\s*/m', '', $text) ?? $text;
        $text = preg_replace('/^\s*[-*+]\s+/m', '• ', $text) ?? $text;
        $text = preg_replace('/^\s*\d+\.\s+/m', '• ', $text) ?? $text;
        $text = preg_replace('/[*_~>]+/', '', $text) ?? $text;
        $text = preg_replace("/\r\n?/", "\n", $text) ?? $text;
        $text = preg_replace("/\n{3,}/", "\n\n", $text) ?? $text;
        $text = trim($text);

        if (mb_strlen($text) <= $limit) {
            return $text;
        }

        $excerpt = mb_substr($text, 0, $limit);
        $lastBreak = max(
            (int) mb_strrpos($excerpt, "\n"),
            (int) mb_strrpos($excerpt, '. '),
            (int) mb_strrpos($excerpt, ' ')
        );

        if ($lastBreak > (int) ($limit * 0.65)) {
            $excerpt = mb_substr($excerpt, 0, $lastBreak);
        }

        return rtrim($excerpt, " \t\n\r\0\x0B.,;:") . '…';
    }

    private function resolveGroup(string $state, array $labels, array $labelsConfig): string
    {
        $matches = static function (array $expected, array $actual): bool {
            $expected = array_map(
                static fn($label): string => mb_strtolower(trim((string) $label)),
                $expected
            );
            return (bool) array_intersect($expected, $actual);
        };

        if ($matches((array) ($labelsConfig['progress'] ?? []), $labels)) {
            return 'progress';
        }
        if ($matches((array) ($labelsConfig['planned'] ?? []), $labels)) {
            return 'planned';
        }
        if ($matches((array) ($labelsConfig['study'] ?? []), $labels)) {
            return 'study';
        }
        if ($state === 'closed' || $matches((array) ($labelsConfig['done'] ?? []), $labels)) {
            return 'done';
        }

        return 'other';
    }

    private function githubRequest(string $url, array $config): array
    {
        $timeout = max(3, (int) ($config['request_timeout'] ?? 8));
        $configuredToken = trim((string) ($config['token'] ?? ''));
        $environmentToken = trim((string) (getenv('GITHUB_TOKEN') ?: ''));
        $token = $environmentToken !== '' ? $environmentToken : $configuredToken;

        $headers = [
            'Accept: application/vnd.github+json',
            'X-GitHub-Api-Version: 2022-11-28',
            'User-Agent: Pool-Pilot-Grav-Roadmap',
        ];
        if ($token !== '') {
            $headers[] = 'Authorization: Bearer ' . $token;
        }

        if (function_exists('curl_init')) {
            $curl = curl_init($url);
            curl_setopt_array($curl, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_CONNECTTIMEOUT => $timeout,
                CURLOPT_TIMEOUT => $timeout,
                CURLOPT_HTTPHEADER => $headers,
            ]);
            $body = curl_exec($curl);
            $status = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
            $error = curl_error($curl);
            curl_close($curl);

            if ($body === false || $error !== '') {
                throw new \RuntimeException('Erreur réseau GitHub : ' . $error);
            }
        } else {
            $context = stream_context_create([
                'http' => [
                    'method' => 'GET',
                    'timeout' => $timeout,
                    'header' => implode("\r\n", $headers),
                    'ignore_errors' => true,
                ],
            ]);
            $body = @file_get_contents($url, false, $context);
            if ($body === false) {
                throw new \RuntimeException('Impossible de contacter GitHub.');
            }
            $status = 200;
            if (isset($http_response_header[0]) &&
                preg_match('/\s(\d{3})\s/', $http_response_header[0], $matches)) {
                $status = (int) $matches[1];
            }
        }

        $data = json_decode((string) $body, true);
        if (!is_array($data)) {
            throw new \RuntimeException('Réponse GitHub non valide.');
        }
        if ($status < 200 || $status >= 300) {
            $message = (string) ($data['message'] ?? 'Erreur GitHub');
            throw new \RuntimeException(sprintf('GitHub HTTP %d : %s', $status, $message));
        }

        return $data;
    }

    private function readCache(string $cacheFile): ?array
    {
        if (!is_file($cacheFile)) {
            return null;
        }

        $contents = @file_get_contents($cacheFile);
        if ($contents === false) {
            return null;
        }

        $data = json_decode($contents, true);
        return is_array($data) ? $data : null;
    }

    private function writeCache(string $cacheFile, array $data): void
    {
        $directory = dirname($cacheFile);
        if (!is_dir($directory)) {
            @mkdir($directory, 0775, true);
        }

        @file_put_contents(
            $cacheFile,
            json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
            LOCK_EX
        );
    }

    private function emptyRoadmap(string $warning, ?string $detail = null): array
    {
        return [
            'ok' => false,
            'generated_at' => time(),
            'generated_iso' => gmdate('c'),
            'owner' => 'amery74',
            'groups' => [
                'done' => [],
                'progress' => [],
                'planned' => [],
                'study' => [],
                'other' => [],
            ],
            'releases' => [],
            'cache_status' => 'empty',
            'warning' => $warning,
            'error_detail' => $detail,
        ];
    }
}
