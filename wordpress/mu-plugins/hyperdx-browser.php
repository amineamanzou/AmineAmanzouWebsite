<?php
/**
 * Plugin Name: The Unreliable HyperDX Browser Telemetry
 * Description: Injects the HyperDX browser SDK when enabled by container environment.
 */

if (!defined('ABSPATH')) {
    exit;
}

function tui_hyperdx_env($key, $default = '') {
    $value = getenv($key);
    if ($value === false || $value === '') {
        return $default;
    }

    return $value;
}

function tui_hyperdx_bool_env($key, $default = false) {
    $value = strtolower(tui_hyperdx_env($key, $default ? 'true' : 'false'));

    return in_array($value, array('1', 'true', 'yes', 'on'), true);
}

function tui_hyperdx_browser_script() {
    if (!tui_hyperdx_bool_env('HYPERDX_BROWSER_ENABLED')) {
        return;
    }

    $api_key = tui_hyperdx_env('HYPERDX_BROWSER_API_KEY');
    $otel_url = tui_hyperdx_env('HYPERDX_BROWSER_URL');
    $service = tui_hyperdx_env('HYPERDX_BROWSER_SERVICE', 'wordpress-frontend');
    $site_name = tui_hyperdx_env('HYPERDX_BROWSER_SITE_NAME', parse_url(home_url(), PHP_URL_HOST));
    $sdk_url = tui_hyperdx_env('HYPERDX_BROWSER_SDK_URL', 'https://esm.sh/@hyperdx/browser@0.22.0');

    if ($api_key === '' || $otel_url === '' || $service === '' || $site_name === '' || $sdk_url === '') {
        return;
    }

    $config = array(
        'apiKey' => $api_key,
        'service' => $service,
        'url' => $otel_url,
        'consoleCapture' => tui_hyperdx_bool_env('HYPERDX_BROWSER_CONSOLE_CAPTURE'),
        'advancedNetworkCapture' => false,
        'maskAllInputs' => true,
        'maskAllText' => tui_hyperdx_bool_env('HYPERDX_BROWSER_MASK_ALL_TEXT'),
        'disableReplay' => false,
        'otelResourceAttributes' => array(
            'site.name' => $site_name,
        ),
    );

    $json_config = wp_json_encode($config);
    $json_sdk_url = wp_json_encode($sdk_url);

    echo "\n<script type=\"module\">\n";
    echo "import HyperDX from {$json_sdk_url};\n";
    echo "const config = {$json_config};\n";
    echo 'const escapedHost = window.location.hostname.replace(/[.*+?^${}()|[\]\\]/g, \'\\\\$&\');' . "\n";
    echo "config.tracePropagationTargets = [new RegExp(escapedHost, 'i')];\n";
    echo "HyperDX.init(config);\n";
    echo "</script>\n";
}

add_action('wp_head', 'tui_hyperdx_browser_script', 1);
