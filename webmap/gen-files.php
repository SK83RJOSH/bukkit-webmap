<?php
    header('Content-Type: text');

    $files = array();
    $files['world-index.json'] = array('default', 'nether');

    foreach($files['world-index.json'] as $world) {
        $files[$world . '/chunk-index.json'] = array();

        for($x = -8; $x < 8; $x++) {
            for($y = -8; $y < 8; $y++) {
                $blocks = array();

                for($block_x = 0; $block_x < 16; $block_x++) {
                    for($block_y = 0; $block_y < 16; $block_y++) {
                        array_push($blocks, array(
                            'id' => rand(1, 3),
                            'x' => ($x * 16) + $block_x,
                            'y' => ($y * 16) + $block_y
                        ));
                    }
                }

                $files[$world . '/players.json'] = array(
                    'SK83RJOSH' => array('last_updated' => time(), 'x' => rand(-16, 16), 'y' => rand(-16, 16)),
                    'MalHT' => array('last_updated' => time(), 'x' => rand(-16, 16), 'y' => rand(-16, 16)),
                    'Ace_X' => array('last_updated' => time(), 'x' => rand(-16, 16), 'y' => rand(-16, 16)),
                    'Banana937' => array('last_updated' => time(), 'x' => rand(-16, 16), 'y' => rand(-16, 16))
                );

                $files[$world . '/chunk-index.json'][$x][$y] = array(
                    'last_updated' => time(),
                    'x' => $x,
                    'y' => $y
                );

                $files[$world . '/' . $x . '.' . $y . '.json'] = $blocks;
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
