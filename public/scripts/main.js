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

    let startTile = null;
    let endTile = null;
    let currentTile = null;
    let currentItem = null;
    let dragging = false;
    let startPoint = {
        x: 0,
        y: 0
    };


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
        context.fillStyle = "white";
        context.textAlign = 'center';
        context.font = '24px Courier New';
        context.fillText(item.short, item.x, item.y + 5);
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
       if(tile.isStart || tile.isEnd) {
            context.fillStyle = 'blue';
       }
        else if(tile.isMousedOver) {
            context.fillStyle = 'black';
        }
        else {
            context.fillStyle = 'pink';
        }
        if(tile.item) {
            context.fillStyle = 'green';
            console.log("drawing tile!");
            drawItem(tile.item);
        }
        else {
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
    }

    function drawTiles(tiles) {
        tiles.forEach((tile) => drawTile(tile));
    }

    function drawItems(items) {
        items.forEach((item) => drawItem(item));
    }

    function checkTiles(tiles, i, j) {
        if(i >= TILE_COLUMNS || j <= TILE_ROWS || i < 0 || j < 0) {
            return false;
        }
    }
    

    function factory() {
        
        let tiles = [];

        for(let i = 0; i < TILE_ROWS; i++) {
            for(let j = 0; j < TILE_COLUMNS; j++) {
                let start =  i == 4 && j == 0;
                let end = i == 4 && j == 19;
                tile =  {
                    x: j * (width + TILE_GAP) + width / 2 + TILE_GAP,
                    y: i * (width + TILE_GAP) + width / 2 + TILE_GAP ,
                    width: width,
                    height: width,
                    isMousedOver:false,
                    item: null,
                    isStart: start,
                    isEnd: end

                };
                tiles.push(tile);
                if(start) {
                    startTile = tile;

                }
                if (end) {
                    endTile = end;
                }
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
    // The StarCraft codebase had the following inheritance structure:  CUnit < CDoodad < CFlingy < CThingy
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
        ).subscribe(x => {
            dragging = true;
            if(x) {
                startPoint = {x:x.x, y:x.y };
            }
        });

    const stops$ = Rx.Observable
        .merge(
            Rx.Observable.fromEvent(window, "mouseup").map(mouseEventToCoordinate),
            Rx.Observable.fromEvent(window, "touchend").map(mouseEventToCoordinate)
        ).subscribe(x => {
            // check if currentItem intersects with currentTile
            if(x && currentItem && currentTile && !currentTile.item && !currentTile.isEnd && !currentTile.isStart) {
                console.log(currentItem);
                console.log(currentTile);
                let intersects = collision(currentItem, currentTile);
                console.log(intersects);
                if(intersects) {
                    currentItem.x = currentTile.x;
                    currentItem.y = currentTile.y;
                    currentTile.item = {
                        name: currentItem.name,
                        x: currentItem.x,
                        y: currentItem.y,
                        width: currentItem.width,
                        height: currentItem.height,
                        short: currentItem.short,
                        isMousedOver: false
                            };
                        
                    drawTile(currentTile);
                }
             
            }            
            currentItem = null;
            startPoint = {
                    x: 0,
                    y: 0
                };
            dragging = false;
        });;

    
    const hand$ = ticker$
            .withLatestFrom(moves$)
            .scan((position, [ticker, moves]) => {
                
                return {x:moves.x, y: moves.y};
            }, {x:stageWidth/2, y:stageWidth/2});
    
    
    function update([ticker,hand, objects]){
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawItemWindow();
        objects.items.forEach(item => {
            item.isMousedOver = collision(item, hand);        
            let isClicked = collision(item, startPoint);
            if (isClicked && currentItem === null) {
                //then we have clicked on this item
                console.log("We clicked the thing!");
                currentItem = {
                    name: item.name,
                    x: item.x,
                    y: item.y,
                    width: item.width,
                    height: item.height,
                    short: item.short
                                }
            }
        });
        objects.tiles.forEach(tile => {
            tile.isMousedOver = collision(tile, hand); 
            if(tile.isMousedOver) {
                currentTile = tile;
            }   
        });
        
        drawItems(objects.items);
        drawTiles(objects.tiles);
        if(dragging && currentItem !== null) {
            currentItem.x = hand.x;
            currentItem.y = hand.y;
            drawItem(currentItem);

        }
    }

    drawTitle();

    const game = Rx.Observable
            .combineLatest(ticker$,hand$, objects$)
            .sample(Rx.Observable.interval(TICKER_INTERVAL))
            .subscribe(update);
});