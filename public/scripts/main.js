$(function() {
    
    const canvas = document.getElementById('stage');
    const context = canvas.getContext('2d');
    context.fillStyle = 'pink';
    const TILE_ROWS  = 10;

    const TILE_COLUMNS = 20;
    const TILE_GAP = 3;

    const TICKER_INTERVAL = 17;

    const stageWidth = 800;
    const stageHeight = 402
    
    const itemWindowHeight = 502;
    const itemWindowWidth = 100;
    let width = (stageWidth - TILE_GAP - TILE_GAP* TILE_COLUMNS ) / TILE_COLUMNS;

    const INITIAL_OBJECTS = {
        tiles: factory(),
        money: 50,
        scare_rep:0,
        guests: [],
        items: [
            {
                name: "ghost",
                scare_value: 5,
                short: "G",
                x: stageWidth + itemWindowWidth /2 ,
                y: TILE_GAP + width + 20,
                width: width,
                height: width,
                isMousedOver: false
            },
            {
                name: "speaker",
                scare_value: 5,
                short: "S",
                x: stageWidth + itemWindowWidth /2 ,
                y: TILE_GAP + width * 2 + 20 * 2,
                width: width,
                height: width,
                isMousedOver: false
            },
            {
                name: "witch",
                scare_value: 5,
                short: "W",
                x: stageWidth + itemWindowWidth /2 ,
                y: TILE_GAP + width * 3 + 20 * 3,
                width: width,
                height: width,
                isMousedOver: false
            },
            {
                name: "vampire",
                scare_value: 5,
                short: "V",
                x: stageWidth + itemWindowWidth /2 ,
                y: TILE_GAP + width * 4 + 20 * 4,
                width: width,
                height: width,
                isMousedOver: false
            },
            {
                name: "lights",
                scare_value: 5,
                short: "L",
                x: stageWidth + itemWindowWidth /2 ,
                y: TILE_GAP + width * 5 + 20 * 5,
                width: width,
                height: width,
                isMousedOver: false
            }
        ]
    }

    function drawItem(item) {
        if(item.isMousedOver) {
            context.fillStyle = 'green';               
        }
        else {
            context.fillStyle = 'black';
        }
        context.beginPath();
        context.rect(
            item.x - item.width / 2,
            item.y - item.width / 2,
            width,
            width
        );
        context.fill();
        context.closePath();

    }

    function drawItemWindow() {
        context.fillStyle = 'white';
        context.beginPath();
        context.rect(
            stageWidth ,
            TILE_GAP,
            itemWindowWidth - TILE_GAP,
            itemWindowHeight - (TILE_GAP * 2)
        );
        context.fill();
        context.closePath();
    }

    function drawTitle() {
        context.textAlign = 'center';
        context.font = '24px Courier New';
        context.fillText('Tower Defense', stageWidth / 2, stageHeight / 2 - 24);
    }

    function drawControls() {
        context.textAlign = 'center';
        context.font = '16px Courier New';
        context.fillText('press [<] and [>] to play', stageWidth / 2, stageHeight / 2);
    }

    function drawGameOver(text) {
        context.clearRect(stageWidth / 4, stageHeight / 3, stageWidth / 2, stageHeight / 3);
        context.textAlign = 'center';
        context.font = '24px Courier New';
        context.fillText(text, stageWidth / 2, stageHeight / 2);
    }


   function drawTile(tile) {
        if(tile.isMousedOver) {
            context.fillStyle = 'black';
        }
        else {
            context.fillStyle = 'pink';
        }
        context.beginPath();
        context.rect(
            tile.x - tile.width / 2,
            tile.y - tile.height / 2,
            tile.width,
            tile.height
        );
        context.fill();
        context.closePath();
    }

    function drawTiles(tiles) {
        tiles.forEach((tile) => drawTile(tile));
    }

    function drawItems(items) {
        items.forEach((item) => drawItem(item));
    }

    function factory() {
        
        let tiles = [];

        for(let i = 0; i < TILE_ROWS; i++) {
            for(let j = 0; j < TILE_COLUMNS; j++) {
                tiles.push( {
                    x: j * (width + TILE_GAP) + width / 2 + TILE_GAP,
                    y: i * (width + TILE_GAP) + width / 2 + TILE_GAP ,
                    width: width,
                    height: width,
                    isMousedOver:false
                })
            }
        }

        return tiles;
    }

    

    const ticker$ = Rx.Observable
        .interval(TICKER_INTERVAL, Rx.Scheduler.requestAnimationFrame)
        .map(() => ({
            time: Date.now(),
            deltaTime: null
        }))
        .scan((previous, current) =>({
            time: current.time,
            deltaTime: (current.time - previous.time)/1000
        }));
    
    const objects$ = ticker$
    .scan(({tiles,score, items}) => {
        return {
            tiles: tiles,
            score: score,
            items: items
        };
    }, INITIAL_OBJECTS);
    const domItem = document.getElementById('stage');

    const mouseEventToCoordinate = mouseEvent => {
        mouseEvent.preventDefault();
        return { 
            x: mouseEvent.clientX,
            y: mouseEvent.clientY
        };
    };
    const touchEventToCoordinate = touchEvent => {
        touchEvent.preventDefault();
        return {
            x: touchEvent.changedTouches[0].clientX,
            y: touchEvent.changedTouches[0].clientY
        };
    };
    
    function collision(tile, thingy) {
        return thingy.x  > tile.x - tile.width / 2
            && thingy.x  < tile.x + tile.width / 2
            && thingy.y  > tile.y - tile.height / 2
            && thingy.y  < tile.y + tile.height / 2;
    }


    const moves$ = Rx.Observable
        .merge(
            Rx.Observable.fromEvent(window, "mousemove").map(mouseEventToCoordinate),
            Rx.Observable.fromEvent(window, "touchmove").map(touchEventToCoordinate)
        )
        .distinctUntilChanged((a, b) => a.x === b.x);
    
    const starts$ = Rx.Observable
        .merge(
            Rx.Observable.fromEvent(window, "mousedown").map(mouseEventToCoordinate),
            Rx.Observable.fromEvent(window, "touchstart").map(mouseEventToCoordinate)
        );

    const hand$ = ticker$
            .combineLatest(moves$, starts$)
            .scan((position, [ticker, moves, starts]) => {

                return {x:moves.x, y: moves.y};
            }, {x:stageWidth/2, y:stageWidth/2});
    
    
    function update([ticker,hand, objects]){
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawItemWindow();
        objects.items.forEach(item => {
            item.isMousedOver = collision(item, hand);            
        });
        objects.tiles.forEach(tile => {
            tile.isMousedOver = collision(tile, hand);            
        });
        drawItems(objects.items);
        drawTiles(objects.tiles);
    }

    drawTitle();

    const game = Rx.Observable
            .combineLatest(ticker$,hand$, objects$)
            .sample(Rx.Observable.interval(TICKER_INTERVAL))
            .subscribe(update);
});