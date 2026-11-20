/**
 * Garante que o ManifestMiddleware do @expo/cli sempre emita URLs absolutas
 * (`http://<host>:<port>/assets/...`) para os assets do manifesto (como `iconUrl`
 * e `adaptiveIcon.foregroundImageUrl`) mesmo quando o Expo Go SDK 58 envia o
 * cabeçalho `Forwarded`.
 *
 * Sem isso, o carregador Coil 3 do SplashScreenView.kt no Expo Go Android recebe
 * um caminho relativo ("assets/assets/images/fitmax-icon.png"), falha ao carregar
 * a imagem e oculta o ícone do app durante o carregamento inicial.
 */
const fs = require('fs');
const path = require('path');

const candidatePaths = [
  path.join(
    __dirname,
    '..',
    'node_modules',
    'expo',
    'node_modules',
    '@expo',
    'cli',
    'build',
    'src',
    'start',
    'server',
    'middleware',
    'ManifestMiddleware.js'
  ),
  path.join(
    __dirname,
    '..',
    'node_modules',
    '@expo',
    'cli',
    'build',
    'src',
    'start',
    'server',
    'middleware',
    'ManifestMiddleware.js'
  ),
];

const targetSnippet =
  'await this.mutateManifestWithAssetsAsync(projectConfig.exp, absoluteBundleUrl, !!shouldUseRelativeManifestUrls);';

const replacementSnippet = [
  "const assetBaseUrl = forwarded?.authority ? `${protocol ?? 'http'}://${forwarded.authority}/` : absoluteBundleUrl;",
  '        // Always use absolute URLs for manifest assets so Expo Go Android Coil loader can fetch iconUrl',
  '        await this.mutateManifestWithAssetsAsync(projectConfig.exp, assetBaseUrl, false);',
].join('\n');

let patchedAny = false;

for (const filePath of candidatePaths) {
  if (!fs.existsSync(filePath)) continue;
  const content = fs.readFileSync(filePath, 'utf8');

  if (content.includes('const assetBaseUrl = forwarded?.authority')) {
    patchedAny = true;
    continue;
  }

  if (content.includes(targetSnippet)) {
    const updated = content.replace(targetSnippet, replacementSnippet);
    fs.writeFileSync(filePath, updated, 'utf8');
    patchedAny = true;
    console.log('[fitmax] Patched Expo CLI ManifestMiddleware for absolute iconUrl.');
  }
}

if (!patchedAny) {
  console.warn('[fitmax] ManifestMiddleware.js target snippet not found (skipped).');
}
