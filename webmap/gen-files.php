<?php
    header('Content-Type: text');

    $files = array();
    $files['world-index.json'] = array('default', 'nether');

    foreach($files['world-index.json'] as $world) {
        for($x = -1; $x < 1; $x++) {
            $files[$world . '/chunk-index.json'] = array();

            for($y = -1; $y < 1; $y++) {
                $blocks = array();

                for($block_x = $x * 16; $block_x < ($x * 16) + 16; $block_x++) {
                    for($block_y = $y * 16; $block_y < ($y * 16) + 16; $block_y++) {
                        array_push($blocks, array(
                            'last_updated' => time(),
                            'block_type' => 'grass',
                            'x' => $block_x,
                            'y' => $block_y,
                        ));
                    }
                }

                array_push($files[$world . '/chunk-index.json'], array(
                    'last_updated' => time(),
                    'x' => $x,
                    'y' => $y
                ));
                $files[$world . '/' . $x . '.' . $y . '.json'] = $blocks;
            }
        }
    }

    foreach($files as $file_name => $file_data) {
        $filename = __DIR__ . '/data/' . $file_name;
        $file_contents = json_encode($file_data, JSON_PRETTY_PRINT) . "\n";

        if(!file_exists($filename)) {
            mkdir(pathinfo($filename, PATHINFO_DIRNAME), 0777, true);
        }

        file_put_contents($filename, $file_contents);

        echo $file_name . ":\n\n";
        echo $file_contents;
        echo "\n";
    }
?>
