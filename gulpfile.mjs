import gulp from 'gulp';
import ts from 'gulp-typescript';
import zip from 'gulp-zip';
import npmDist from 'gulp-npm-dist';
import changed from 'gulp-changed';
import { exec } from 'child_process';
import merge from 'merge-stream';


// *********************************
// bod-send-to-bartender
// *********************************
// Compile TypeScript files and generate .d.ts files
gulp.task('compile', () => {
    const tsProjectMainCompile = ts.createProject('tsconfig.json');
    const destMain = 'target/dist/environment-loader';

    const mainFiles = gulp.src(['src/environment-loader/**/*.ts'], { base: 'src/environment-loader' })
        .pipe(changed(destMain, { extension: '.js' }))
        .pipe(tsProjectMainCompile())
        .pipe(gulp.dest(destMain));


    return merge(mainFiles);
});

gulp.task('copy-json', () => {
    const destMain = 'target/dist/environment-loader/environment-loader';
    const mainJsonFiles = gulp.src(['src/environment-loader/**/*.json'],{ base: 'src/environment-loader' }) // Select all JSON files in src directory
        .pipe(changed(destMain)) // Only pass through changed files
        .pipe(gulp.dest(destMain)); // Copy them to the destination
    return merge(mainJsonFiles);
});

gulp.task('copy-node-modules', () => {
    const dest = 'target/dist/environment-loader/node_modules';
    return gulp.src(['node_modules/**/*'])
        .pipe(changed(dest))
        .pipe(gulp.dest(dest));
});

gulp.task('run-jest',(done)=>{ 
    exec('npx jest --verbose --passWithNoTests --testMatch="**/*.unit-test.ts" src/environment-loader', (err, stdout, stderr)=>{
        console.log(stdout);
        console.log(stderr);
        done(err);
    });
});

gulp.task('run-jest-coverage',(done)=>{ 
    exec('npx jest --coverage --passWithNoTests --testMatch="**/*.unit-test.ts" src/environment-loader', (err, stdout, stderr)=>{
        console.log(stdout);
        console.log(stderr);
        done(err);
    });
});

gulp.task('assemble', gulp.parallel('compile', 'copy-json', 'copy-node-modules'));

gulp.task('npm', gulp.series('assemble', () => {
    const dest = 'target/npm/environment-loader';

    const rootFiles = gulp.src(
        ['package.json','README.md']
    )
    .pipe(gulp.dest(dest));

    
    // Copy .js and .json files from target/dist/environment-loader
    const jsAndJsonFiles = gulp.src([
        'target/dist/environment-loader/**/*.js',
        'target/dist/environment-loader/**/*.json',
        'target/dist/environment-loader/**/*.d.ts',
        '!target/dist/environment-loader/node_modules/**'
    ], { base: 'target/dist/environment-loader' })
    .pipe(gulp.dest(dest));

    // Copy .ts files from src/environment-loader
    const tsFiles = gulp.src([
        'src/environment-loader/**/*.ts',
    ], {base: 'src/environment-loader'})
    .pipe(gulp.dest(dest));

    return merge(rootFiles, jsAndJsonFiles, tsFiles);
}));

gulp.task('test', gulp.series('assemble','run-jest'));

gulp.task('default', gulp.parallel('assemble'));

