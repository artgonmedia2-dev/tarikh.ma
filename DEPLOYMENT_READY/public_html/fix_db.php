<?php
header('Content-Type: text/plain');

echo "--- REPARATION BASE DE DONNEES TARIKH.MA (PDO Direct) ---\n";

$env_path = __DIR__ . '/../tarikh-backend/.env';

if (!file_exists($env_path)) {
    die("[FAIL] Fichier .env introuvable a $env_path");
}

$env = file_get_contents($env_path);
$config = [];
foreach (explode("\n", $env) as $line) {
    if (trim($line) === '' || strpos($line, '#') === 0) continue;
    if (strpos($line, '=') !== false) {
        list($key, $value) = explode('=', $line, 2);
        $config[trim($key)] = trim($value);
    }
}

$host = $config['DB_HOST'] ?? '127.0.0.1';
$db   = $config['DB_DATABASE'] ?? '';
$user = $config['DB_USERNAME'] ?? '';
$pass = $config['DB_PASSWORD'] ?? '';

// Fix common parsing issues for values with quotes
$db = trim($db, '"\' ');
$user = trim($user, '"\' ');
$pass = trim($pass, '"\' ');

if (empty($db)) die("[FAIL] DB_DATABASE est vide dans le .env !");

try {
    $dsn = "mysql:host=$host;dbname=$db;charset=utf8mb4";
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    echo "[OK] Connexion PDO reussie.\n";

    $email = 'admin@tarikh.ma';
    $password = 'admin123';
    $hash = password_hash($password, PASSWORD_BCRYPT);

    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user_row = $stmt->fetch();

    if ($user_row) {
        echo "Utilisateur trouve. Mise a jour du mot de passe hache...\n";
        $update = $pdo->prepare("UPDATE users SET password = ?, role = 'admin' WHERE id = ?");
        $update->execute([$hash, $user_row['id']]);
        echo "[OK] Mot de passe mis a jour vers : $password (Hache avec succes)\n";
    } else {
        echo "Utilisateur inexistant. Creation...\n";
        $insert = $pdo->prepare("INSERT INTO users (name, email, password, role, created_at, updated_at) VALUES ('Admin', ?, ?, 'admin', NOW(), NOW())");
        $insert->execute([$email, $hash]);
        echo "[OK] Admin cree avec succes !\n";
    }
    
    echo "\n--- VERIFICATION FINALE ---\n";
    $stmt = $pdo->prepare("SELECT email, role, password FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $final = $stmt->fetch();
    echo "Email : " . $final['email'] . "\n";
    echo "Role : " . $final['role'] . "\n";
    echo "Hash : " . substr($final['password'], 0, 10) . "...\n";

} catch (PDOException $e) {
    echo "[FAIL] Erreur PDO : " . $e->getMessage() . "\n";
}
?>
