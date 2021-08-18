import * as fs from 'fs-extra';
import { exec } from 'child_process';
import * as path from 'path';
import targz = require('targz');
import unzip = require('unzip-stream');

export class Unpack {
    static unpack(input: fs.PathLike, target: fs.PathLike): Promise<void> {
        return new Promise((resolve, reject) => {
            if (input.toString().endsWith('.tar.gz')) {
                targz.decompress({
                    src: input,
                    dest: target
                }, (err: Error) => {
                    err ? reject(err) : resolve();
                });
            }
            else if (input.toString().endsWith('.zip')) {
                if (process.platform === 'darwin') {
                    fs.mkdirpSync(target.toString());
                    exec(`cd ${target} && unzip -qo ${path.basename(input.toString())}`, (err) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                } else {
                    fs.createReadStream(input)
                        .pipe(unzip.Extract({ path: target }))
                        .on('error', reject)
                        .on('close', resolve);
                }
            }
            else {
                reject(`Unsupported extension for '${input}'`);
            }
        });
    }
}