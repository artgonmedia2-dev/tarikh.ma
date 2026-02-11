<?php
use Illuminate\Support\Facades\Hash;
use App\Models\User;

header('Content-Type: text/plain');

$backend_path = __DIR__ . '/../tarikh-backend';
require $backend_path . '/vendor/autoload.php';
$app = require_once $backend_path . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "--- CREATION ADMIN TARIKH.MA ---\n";

try {
    $email = 'admin@tarikh.ma';
    $password = 'admin123'; // A changer après connexion !

    $user = User::where('email', $email)->first();
    
    if ($user) {
        echo "L'utilisateur existe deja. Mise a jour du mot de passe...\n";
        $user->password = Hash::make($password);
        $user->role = 'admin';
        $user->save();
        echo "[OK] Mot de passe mis a jour vers : $password\n";
    } else {
        echo "Creation d'un nouvel administrateur...\n";
        User::create([
            'name' => 'Admin',
            'email' => $email,
            'password' => Hash::make($password),
            'role' => 'admin'
        ]);
        echo "[OK] Admin cree avec succes !\n";
        echo "Email : $email\n";
        echo "Password : $password\n";
    }
} catch (Throwable $e) {
    echo "[FAIL] Erreur : " . $e->getMessage() . "\n";
}
?>
