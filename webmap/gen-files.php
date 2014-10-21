<?php
    header('Content-Type: text');

    if(!(substr($_SERVER['REMOTE_ADDR'], 0, 8) == '192.168.' || $_SERVER['REMOTE_ADDR'] == '127.0.0.1')) {
        echo 'This script can only be ran by the server host.'; die;
    }

    $materials = array('AIR', 'STONE', 'GRASS', 'DIRT');
    $files = array();
    $files['world-index.json'] = array('default', 'nether');

    foreach($files['world-index.json'] as $world) {
        $files[$world . '/chunk-index.json'] = array();

        for($x = -8; $x < 8; $x++) {
            for($z = -8; $z < 8; $z++) {
                $blocks = array();

                for($block_x = 0; $block_x < 16; $block_x++) {
                    for($block_z = 0; $block_z < 16; $block_z++) {
                        array_push($blocks, array(
                            'material' => $materials[rand(1, sizeof($materials) - 1)],
                            'x' => ($x * 16) + $block_x,
                            'y' => rand(0, 3),
                            'z' => ($z * 16) + $block_z
                        ));
                    }
                }

                $files[$world . '/players.json'] = array(
                    'SK83RJOSH' => array('last_updated' => time(), 'x' => rand(-128, 128), 'z' => rand(-128, 128)),
                    'MalHT' => array('last_updated' => time(), 'x' => rand(-128, 128), 'z' => rand(-128, 128)),
                    'Ace_X' => array('last_updated' => time(), 'x' => rand(-128, 128), 'z' => rand(-128, 128)),
                    'Banana937' => array('last_updated' => time(), 'x' => rand(-128, 128), 'z' => rand(-128, 128))
                );

                $files[$world . '/chunk-index.json'][$x][$z] = array(
                    'last_updated' => time(),
                    'x' => $x,
                    'z' => $z
                );

                $files[$world . '/' . $x . '.' . $z . '.json'] = $blocks;
            }
        }
    }

    foreach($files as $file_name => $file_data) {
        $filename = __DIR__ . '/data/' . $file_name;
        $file_contents = json_encode($file_data, JSON_PRETTY_PRINT);

        if(!file_exists(pathinfo($filename, PATHINFO_DIRNAME))) {
            mkdir(pathinfo($filename, PATHINFO_DIRNAME), 0777, true);
        }

        file_put_contents($filename, $file_contents);

        echo $file_name . ":\n\n";
        echo $file_contents;
        echo "\n";
    }
?>
