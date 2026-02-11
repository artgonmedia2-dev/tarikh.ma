<?php
header('Content-Type: text/plain');
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "--- CREATION DU LIEN SYMBOLIQUE (STORAGE) ---\n";

// Détection automatique des chemins
$public_html = __DIR__; 
$target = realpath($public_html . '/../tarikh-backend/storage/app/public');
$link = $public_html . '/storage';

echo "Public HTML : $public_html\n";
echo "Cible       : " . ($target ? $target : "NON TROUVEE") . "\n";
echo "Lien        : $link\n\n";

if (!$target) {
    // Tentative alternative si le backend est un niveau plus haut
    $target = realpath($public_html . '/../../tarikh-backend/storage/app/public');
    if ($target) {
        echo "Cible (Alternative) : $target\n";
    } else {
        die("[FAIL] Le dossier cible (storage/app/public) n'existe pas. Verifiez que 'tarikh-backend' est bien au meme niveau que 'public_html'.\n");
    }
}

if (file_exists($link)) {
    echo "[WARNING] Le lien ou dossier '$link' existe deja.\n";
    if (is_link($link)) {
        echo "C'est deja un lien symbolique. Suppression pour recreer...\n";
        unlink($link);
    } else {
        echo "C'est un dossier reel. Renommage en 'storage_old' par securite...\n";
        rename($link, $link . '_old_' . time());
    }
}

try {
    if (symlink($target, $link)) {
        echo "[OK] Le lien symbolique a ete cree avec succes !\n";
        echo "Vous pouvez maintenant voir les images et fichiers sur le site.\n";
    } else {
        echo "[FAIL] Impossible de creer le lien symbolique.\n";
    }
} catch (Exception $e) {
    echo "[FAIL] Erreur : " . $e->getMessage() . "\n";
}
?>
