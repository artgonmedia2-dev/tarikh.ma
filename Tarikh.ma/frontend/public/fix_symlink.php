<?php
// fix_symlink.php
// Version : Force Shell
ini_set('display_errors', 1);
error_reporting(E_ALL);

echo "<h1>Mode Force : Shell Link</h1>";

$target = __DIR__ . '/../tarikh-backend/storage/app/public';
$link = __DIR__ . '/storage';

echo "<p>Cible : $target</p>";
echo "<p>Lien : $link</p>";

// Nettoyage préalable (si lien cassé ou dossier vide)
if (is_link($link)) {
    echo "<p>Lien existant détecté. Suppression pour recréation propre...</p>";
    unlink($link);
}

// Méthode 1 : PHP symlink (si dispo)
if (function_exists('symlink')) {
    echo "<p>Tentative PHP symlink()...</p>";
    if (@symlink($target, $link)) {
        echo "<p style='color:green'>SUCCÈS via PHP !</p>";
    } else {
        echo "<p style='color:red'>Échec via PHP.</p>";
    }
} else {
    echo "<p style='color:orange'>Fonction PHP symlink() désactivée. Passage au Shell.</p>";
}

// Méthode 2 : Shell exec (ln -s)
if (!file_exists($link)) {
    echo "<p>Tentative Shell (ln -s)...</p>";
    // On utilise plusieurs fonctions au cas où certaines sont désactivées
    $cmd = "ln -s " . escapeshellarg($target) . " " . escapeshellarg($link) . " 2>&1";
    
    $output = "N/A";
    if (function_exists('shell_exec')) {
        $output = shell_exec($cmd);
        echo "<pre>Sortie shell_exec: $output</pre>";
    } elseif (function_exists('exec')) {
        exec($cmd, $outLines, $ret);
        echo "<pre>Sortie exec: " . implode("\n", $outLines) . " (Code: $ret)</pre>";
    } elseif (function_exists('system')) {
        echo "<pre>Sortie system: ";
        system($cmd, $ret);
        echo " (Code: $ret)</pre>";
    } else {
        echo "<p style='color:red'>Aucune fonction shell disponible (shell_exec, exec, system).</p>";
    }
}

// Vérification finale
clearstatcache();
if (file_exists($link) && is_link($link)) {
    echo "<h2 style='color:green'>VICTOIRE : Le lien est actif !</h2>";
    echo "<p>Vérifiez vos images maintenant.</p>";
} else {
    echo "<h2 style='color:red'>ÉCHEC TOTAL</h2>";
    echo "<p>Solution alternative :</p>";
    echo "<ul>";
    echo "<li>Connectez-vous à votre Panel Hostinger.</li>";
    echo "<li>Allez dans <strong>Avancé > Configuration PHP</strong>.</li>";
    echo "<li>Cherchez 'Disabled Functions' et retirez 'symlink' de la liste.</li>";
    echo "<li>Ou connectez-vous via SSH et tapez : <code>ln -s ".realpath($target)." ".realpath(dirname($link))."/storage</code></li>";
    echo "</ul>";
}
?>
