/*
 * @Author: Kinnon.Z 
 * @Date: 2018-06-21 10:44:32 
 * @Last Modified by: Kinnon.Z
 * @Last Modified time: 2018-07-25 17:22:10
 */
import gulp from "gulp";
import CONST from "../const";
import minimist from "minimist";
import Utils from "../utils/utils";
import PluginError from "plugin-error";
import path from "path";

const P = require("gulp-load-plugins")();
const args = minimist(process.argv.slice(2));

gulp.task("gift:cpy_src", done => {
    if (typeof (args.dir) != "string") {
        throw new PluginError("cpy_src", "YOU MUST SPECIFY ONE OR MORE DIRECTORY");
    }

    let dirs =  Utils.uniqueArray(args.dir.split(",").map(f => f.trim()));
    let glob = dirs.map(each => path.join(each, "**/*"))
                .concat(dirs.map(each => `!${path.join(each, "**/*.exml")}`));
    return gulp.src(glob)
            .pipe(P.debug())
            .pipe(P.rename(path => path.dirname = ""))
            .pipe(gulp.dest(CONST.Lrs_PictureSource_Path));
});