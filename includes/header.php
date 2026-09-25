<?php
$page = $page ?? 'home';
$favoriteCount = 0;
?>
<header class="topbar">
  <a class="brand" href="index.php" aria-label="Paw and Home home">
    <span class="brand-mark">✦</span>
    <span><strong>Paw &amp; Home</strong><small>FIELD NOTES / PETS IN TRANSITION</small></span>
  </a>
  <nav aria-label="Main navigation">
    <a class="<?= $page === 'home' ? 'active' : '' ?>" href="index.php">Journal</a>
    <a class="<?= $page === 'pets' || $page === 'pet' ? 'active' : '' ?>" href="pets.php">Find a pet</a>
    <a class="<?= $page === 'rehome' ? 'active' : '' ?>" href="rehome.php">Rehome</a>
  </nav>
  <div class="header-actions">
    <a class="favorite-link" href="pets.php?favorites=true">Saved <span id="favorite-count"><?= $favoriteCount ?></span></a>
    <a class="button button-dark" href="adopt.php">Start adoption</a>
  </div>
</header>
