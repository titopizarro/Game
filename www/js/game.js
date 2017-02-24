var app = {

    inicio: function(){
        
        velocidadX = 0;
        velocidadY = 0;
        puntuacion = 0;
        dificultad = 0;
        balas = 250;
        altoMax = 0;
        fondo = 0;
        
        alto  = document.documentElement.clientHeight;
        ancho = document.documentElement.clientWidth;
        
        app.vigilaSensores();
        app.iniciaJuego();

    },

    iniciaJuego: function(){

        function preload() {
            game.physics.startSystem(Phaser.Physics.ARCADE);

            game.load.image('phaser', 'assets/phaser-dude.png');
            game.load.image('bullet', 'assets/bullet0.png');
            game.load.spritesheet('veggies', 'assets/fruitnveg32wh37.png', 32, 32);
        }

        var boy;
        var bullets;
        var veggies;
        var cursors;
        
        var bulletTime = 0;
        var bullet;

        function create() {

            styleText = { fontSize: '20px', fill: '#ff9100' };

            scoreText = game.add.text(10, 10, 'Puntos', styleText );
            scoreText = game.add.text(10, 35, puntuacion, styleText );   

            difficultyText = game.add.text(90, 10, 'Dificultad', styleText );
            difficultyText = game.add.text(90, 35, dificultad, styleText );       

            bulletsText = game.add.text(200, 10, 'Balas', styleText );
            bulletsText = game.add.text(200, 35, balas, styleText ); 

            var styleMsg = { font: "16px", fill: "#ffea00", align: "center" };
            msgText = game.add.text(10, alto - 70, 'Para disparar inclina el movil hacia arriba', styleMsg);
            
            fondo = game.stage;
            fondo.backgroundColor = '#2d2d2d';

            //  This will check Group vs. Group collision (bullets vs. veggies!)

            veggies = game.add.group();
            veggies.enableBody = true;
            veggies.physicsBodyType = Phaser.Physics.ARCADE;

            for (var i = 0; i < 50; i++)
            {                
                var c = veggies.create(app.inicioX(), app.inicioY(), 'veggies', game.rnd.integerInRange(0, 36));
                c.name = 'veg' + i;
                c.body.immovable = true;
            }

            bullets = game.add.group();
            bullets.enableBody = true;
            bullets.physicsBodyType = Phaser.Physics.ARCADE;

            for (var i = 0; i < 20; i++)
            {
                var b = bullets.create(0, 0, 'bullet');
                b.name = 'bullet' + i;
                b.exists = false;
                b.visible = false;
                b.checkWorldBounds = true;
                b.events.onOutOfBounds.add(resetBullet, this);
            }

            boy = game.add.sprite( ancho/2, alto-50, 'phaser');            
            game.physics.enable(boy, Phaser.Physics.ARCADE);

            boy.body.collideWorldBounds = true;
            boy.body.checkCollision = true;
            boy.body.onWorldBounds = new Phaser.Signal();
            boy.body.onWorldBounds.add(app.decrementaPuntuacion, this);

            // boy.events.onOutOfBounds.add(app.alertPoints, this);

            cursors = game.input.keyboard.createCursorKeys();
            game.input.keyboard.addKeyCapture([ Phaser.Keyboard.SPACEBAR ]);

        }

        function update(){

            var factorDificultad = (300 + (dificultad * 10));            
            boy.body.velocity.x = ( velocidadX * (-1 * factorDificultad) );

            //  As we don't need to exchange any velocities or motion we can the 'overlap' 
            //  check instead of 'collide'
            game.physics.arcade.overlap(bullets, veggies, collisionHandler, null, this);
                      
            if (cursors.left.isDown)
            {
                boy.body.velocity.x = -300;
            }
            else if (cursors.right.isDown)
            {
                boy.body.velocity.x = 300;
            }

            if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR))
            {
                fireBullet();
            }

            if ( velocidadY > 4 ) {
                fireBullet();
            }

            if ( balas == 0 ) {
                boy.body.moves = false;
            }
            
        }   

        var estados = { preload: preload, create: create, update: update };
        var game = new Phaser.Game(ancho, alto, Phaser.CANVAS, 'phaser', estados);

        function fireBullet () {

            balas = balas - 1;

            if ( balas >= 0 ) {
                bulletsText.text = balas;

                if ( balas < 150 && balas > 50 ) {
                    msgText.text = 'Recuerda que las balas tienen un limite';    
                }
                
                if (game.time.now > bulletTime)
                {
                    bullet = bullets.getFirstExists(false);

                    if (bullet)
                    {
                        bullet.reset( boy.x + 6, boy.y - 8 );
                        bullet.body.velocity.y = -300;
                        bulletTime = game.time.now + 150;                    
                    }
                }
            } else {
                msgText.text = 'Te quedaste sin balas, \nagita con fuerza el movil para reiniciar';                
                boy.body.moves = false;
            }

        }

        //  Called if the bullet goes out of the screen
        function resetBullet (bullet) {

            bullet.kill();

        }

        //  Called if the bullet hits one of the veg sprites
        function collisionHandler (bullet, veg) {

            bullet.kill();
            veg.kill();
            app.incrementaPuntuacion();

        }
    },

    decrementaPuntuacion: function(){
        
        fondo.backgroundColor = '#ff5722';
        msgText.text = 'Al tocar los bordes pierdes puntos!!';
        puntuacion = puntuacion - 1;
        scoreText.text = puntuacion;
        if ( puntuacion < 0) {
            scoreText.fill = '#d50000';
        }        
        
    },

    incrementaPuntuacion: function(){
        fondo.backgroundColor = '#2d2d2d'; 
         
        puntuacion = puntuacion + 2;
        scoreText.text = puntuacion;
        
        if ( puntuacion > 0 ){
            dificultad = dificultad + 1;
            difficultyText.text = dificultad;
        }

        if ( puntuacion < 0) {
            scoreText.fill = '#d50000';            
        } else {
            scoreText.fill = '#ff9100';
        }
    },

    inicioX: function(){
        return app.numeroAleatorioHasta( ancho - 50 );
    },

    inicioY: function(){

        altoMax = app.numeroAleatorioHasta( alto - 110 );

        var limiteSuperior = altoMax > 60;
        var limiteInferior = altoMax < ( alto - 50 );

        if ( limiteSuperior && limiteInferior ) {            
            return altoMax;            
        } else if ( !limiteSuperior ) {
            return altoMax + 60;
        }
       
    },

    numeroAleatorioHasta: function(limite){
        return Math.floor( Math.random() * limite );
    },

    vigilaSensores: function(){
        
        function onError() {
            console.log('onError!');
        }

        function onSuccess(datosAceleracion){
            app.detectaAgitacion(datosAceleracion);
            app.registraDireccion(datosAceleracion);           
        }

        navigator.accelerometer.watchAcceleration(onSuccess, onError,{ frequency: 10 });
    },

    detectaAgitacion: function(datosAceleracion){
        var agitacionX = datosAceleracion.x > 10;
        var agitacionY = datosAceleracion.y > 10;

        if (agitacionX || agitacionY){
            setTimeout(app.recomienza, 1000);
        } 
    },

    recomienza: function(){
        document.location.reload(true);
    },

    registraDireccion: function(datosAceleracion){
        velocidadX = datosAceleracion.x ;
        velocidadY = datosAceleracion.y ;
    }

};

if ('addEventListener' in document) {
    document.addEventListener('deviceready', function() {
        app.inicio();
    }, false);
}