
let terraformsByAlphaSector = {
    "Arshi_En": [],
    "Asama": [],
    "Foundation": [],
};

let terraformsByLandType = {
    "Prismatic": [],
    "Badlands": [],
    "Tundra": [],
    "Fungal": [],
    "Desert": [],
    "Artificial": [],
    "Wasteland": [],
    "Volcanic": [],
    "Rocky": [],
    "Grass": [],
};

import data from '../../data/terraforms.json' assert { type: 'json' }
var terraforms = data;


terraforms.forEach((terraform) => {
    terraformsByAlphaSector[terraform.alpha_sector].push(terraform);

    const { token_name } = terraform;
    const terraformId = token_name.replace( /^\D+/g, ''); // replace all leading non-digits with nothing

}) 


let shuffledTerraforms = {
    "Arshi_En": [],
    "Asama": [],
    "Foundation": []
}

let sequentialTerraforms = {
    "Arshi_En": [],
    "Asama": [],
    "Foundation": []
}

let sectors = ["Foundation","Arshi_En", "Asama"]
let sectorLengths = [16,100,99]
console.log("Shuffling Terraforms")

    for (let t = 0; t < sectors.length; t++){


    let gridDim = sectorLengths[t]
    
    let sectorTerraforms = terraformsByAlphaSector[sectors[t]]
    
    

    sectorTerraforms.forEach((terraform) => {
        terraformsByLandType[terraform.land_type].push(terraform)
    })

    var landTypeCounts = updateLandTypeCounts(terraformsByLandType)

    //Create nxn array that has x, y, and possible land types
    let possibleTiles = []
    for (let i = 0; i < gridDim; i++){
        for (let j = 0; j < gridDim; j++){
            //keep array length equal to number of terraforms in sector
            if (i*gridDim + j < sectorTerraforms.length){
                var tile = {
                    "location": {x:j+1, y:i+1},
                    "possible_types": ["Prismatic","Artificial", "Tundra","Wasteland","Badlands", "Volcanic","Desert", "Fungal","Rocky", "Grass"],
                    "numOptions": []
                    
                    }
                
                tile.numOptions = tile.possible_types.length
                possibleTiles.push(tile)
                }  
            }
        }
    
    

    let assignedTilesOrdered = []
    for (let i = 0; i < gridDim; i++){
        for (let j = 0; j < gridDim; j++){
            //keep array length equal to number of terraforms in sector
            if (j*gridDim + i < sectorTerraforms.length){
                var tile = {
                    "location": {x:j+1, y:i+1}, 
                    "token_name": [],
                    "land_type": []
    
                }
                assignedTilesOrdered.push(tile)
            }
            
        }
    }
    

    let assignedTiles = [];
    

    //Checks for land counts to hit 0 and updates all possible tiles without that type
    for (var land in landTypeCounts){
        if (landTypeCounts[land] == 0) {
            
        
        possibleTiles.forEach( tile => {
            tile.possible_types = tile.possible_types.filter(type => type !== land)
            tile.numOptions = tile.possible_types.length
            }) 
        }          
        
    } 

    // these are the land types that are allowed to be adjacent to each other
    var constraints = {
        grass: ["Grass","Rocky", "Fungal", "Tundra", "Wasteland","Artificial", "Badlands", "Desert", "Volcanic", "Prismatic"],
        rocky: ["Rocky", "Grass","Fungal", "Tundra", "Wasteland","Artificial", "Badlands", "Desert", "Volcanic", "Prismatic"],
        artificial: ["Rocky", "Grass", "Tundra", "Artificial", "Desert","Prismatic"],
        tundra: ["Rocky", "Grass","Fungal", "Tundra", "Artificial", "Prismatic"],
        desert: ["Rocky", "Grass","Badlands", "Desert","Artificial","Volcanic"],
        fungal: ["Rocky", "Grass","Fungal", "Tundra", "Prismatic"],
        badlands: ["Rocky", "Grass","Badlands",  "Desert","Volcanic","Wasteland"],
        volcanic: ["Rocky", "Grass", "Volcanic","Wasteland","Badlands","Desert"],
        wasteland: ["Rocky", "Grass", "Volcanic","Wasteland","Badlands"],
        prismatic: ["Prismatic", "Grass", "Rocky"]
    }


    
    //initialize land selections. selects first tile type and location
    if (t == 0){
        var previousTile = {
            possible_types: ["Prismatic"],
            location: {x: Math.floor(gridDim/2),y: Math.floor(gridDim/2)},
            numOptions: 0
        }
        var token = selectFromType("Prismatic", terraformsByLandType)
        token.location = {x: previousTile.x, y:previousTile.y}
        assignedTiles.push(token)
        delete token.pool_link
        delete token.image
    }else{
        var previousTile = {
            possible_types: ["Artificial"],
            location: {x: Math.floor(gridDim/2),y: Math.floor(gridDim/2)},
            numOptions: 0
        }
        var token = selectFromType("Artificial", terraformsByLandType)
        token.location = {x: previousTile.location.x, y:previousTile.location.y}
        assignedTiles.push(token)
        delete token.pool_link
        delete token.image
    }

    //iterate for all the terraforms in each sector
    for (let i = 0; i < sectorTerraforms.length; i++){
        //only select less common land types first
        if (landTypeCounts["Artificial"] !== 0 || landTypeCounts["Badlands"] !== 0 || landTypeCounts["Desert"] !== 0 || landTypeCounts["Fungal"] !== 0 || landTypeCounts["Tundra"] !== 0 || landTypeCounts["Volcanic"] !== 0 || landTypeCounts["Wasteland"] || landTypeCounts["Rocky" !== 0]){
            var chooseRare = true;
        }else{chooseRare = false}
        
        //select tile and extract relevant info
        var selectedTile = selectTile(possibleTiles, previousTile, landTypeCounts[previousTile.outType] !== 0)
        var selectedType = selectedTile.outType
        var selectedX = selectedTile.location.x
        var selectedY = selectedTile.location.y
        var selectedIdx = xyToIdx(selectedX, selectedY, gridDim)
        
        //choose token out of available of that type
        var token = selectFromType(selectedType, terraformsByLandType)
        //sanitize token
        delete token.pool_link
        delete token.image

        token.location = { 
            x:selectedX, 
            y:selectedY}

        if ( i == 0){
            assignedTiles = [token]
        }else{
            assignedTiles.push(token)
        }

        assignedTilesOrdered[selectedIdx] = token

        //remove land from land type
        terraformsByLandType[selectedType] = terraformsByLandType[selectedType].filter(land => land.token_name !== token.token_name)

        //remove ability to select land again
        possibleTiles[selectedIdx].possible_types = []

        propagateConstraints(token, possibleTiles, gridDim, sectorTerraforms.length)

        landTypeCounts = updateLandTypeCounts(terraformsByLandType)

        //Checks for land counts to hit 0 and updates all possible tiles without that type
        for (var land in landTypeCounts){
            if (landTypeCounts[land] == 0) {
                possibleTiles.forEach( tile => {
                    tile.possible_types = tile.possible_types.filter(type => type !== land)
                    tile.numOptions = tile.possible_types.length
                })           
            }
        } 
 
        previousTile = selectedTile;
    }

    sequentialTerraforms[sectors[t]] = assignedTilesOrdered
    shuffledTerraforms[sectors[t]] = assignedTiles
    console.log("Finished Shuffling", sectors[t], "Sector")
}

export var orderedTerraforms = sequentialTerraforms


// function to select a tile, add it to assigned tiles, and remove it from possible tiles
function selectTile(inTiles, lastTile, count){
        
    var lowestState = determineLowestState(inTiles)
    var tilePool = lowestState.lowestTiles

     //filter to only select from tiles that are adjacent to last tile if possible
     var closeTiles = inTiles.filter(tiles => Math.abs(tiles.location.x - lastTile.location.x) < 2 && Math.abs(tiles.location.y - lastTile.location.y) < 2 )
     closeTiles = closeTiles.filter(tile => tile.possible_types.length > 0)
     
     if (closeTiles.length > 0){
        var tileSelected = closeTiles[Math.floor(Math.random() * closeTiles.length)]
     }else {
        var tileSelected = tilePool[Math.floor(Math.random() * tilePool.length)]
     }
     

     //don't choose grass if there are other options. Grass will be "filler" type
     if (chooseRare && (tileSelected.possible_types.includes("Grass") && tileSelected.possible_types.length > 1)){
        tileSelected.possible_types.filter( rare => rare !== "Grass")
     }

     // option to use rocky as "filler" as well
    /* if (chooseRare && tileSelected.possible_types.includes("Rocky")){
        tileSelected.possible_types.filter( rare => rare !== "Rocky")
     }  */

     //checks there are still land types of last land available, and forces that type again if so
     if (count && tileSelected.possible_types.includes(lastTile.land_type)){
        var type = lastTile.land_type
     }else{
         //selects other land type at random if previous type is used up
        var type = tileSelected.possible_types[Math.floor(Math.random()*tileSelected.possible_types.length)]
     }
     
     
     const tempX = tileSelected.location.x
     const tempY = tileSelected.location.y

     var outObject = {
         outType: type,
         location: {x:tempX, y:tempY}
     }
     return outObject
}


function xyToIdx(x,y,dim){
    var idx = (y-1)*dim + (x-1);
    return idx
}

//still working on this function. currently not used
function grabNeighbors(inLands,dim){
    for (var i = 0; i < inLands.length; i++){
        var tempLand = inLands[i];
        var tempX = tempLand.location.x
        var tempY = tempLand.location.y
        var tempIdx = xyToIdx(tempX,tempY, dim)
        tempLand.neighbors = {top:{}, topright: {}, right: {}, bottomright:{}, bottom: {}, bottomleft: {}, left: {}, topleft: {}}
        var neighbors = []

        if (tempY < dim && tempIdx + dim < inLands.length){
            const topIdx = xyToIdx(tempX, tempY + 1, dim)
            var top = inLands[topIdx]
            
            if ("neighbors" in top){
                delete top.neighbors
            }
        }else{ top = {}}

        if (tempX < dim  && tempY < dim  && tempIdx + dim + 1 < inLands.length){
            const toprightIdx = xyToIdx(tempX + 1, tempY + 1, dim)
            var topright = inLands[toprightIdx]
            if ("neighbors" in topright){
                delete topright.neighbors
            }
        }else{ topright = {}}

        if (tempX < dim  && tempIdx + 1< inLands.length){
            const rightIdx = xyToIdx(tempX + 1, tempY, dim)
            var right = inLands[rightIdx]
            if ("neighbors" in right){
                delete right.neighbors
            }
        }else{ right = {}}

        if (tempX < dim && tempY > 1){
            const bottomrightIdx =xyToIdx(tempX + 1, tempY - 1, dim)
            var bottomright = inLands[bottomrightIdx]
            if ("neighbors" in bottomright){
                delete bottomright.neighbors
            }
        }else{ bottomright = {}}

        if (tempY > 1){
            const bottomIdx = xyToIdx(tempX, tempY - 1, dim)
            var bottom = inLands[bottomIdx]
            if ("neighbors" in bottom){
                delete bottom.neighbors
            }
        }else{ bottom = {}}

        if (tempX > 1 && tempY > 1){
            const bottomleftIdx = xyToIdx(tempX - 1, tempY - 1, dim)
            var bottomleft = inLands[bottomleftIdx]
            if ("neighbors" in bottomleft){
                delete bottomleft.neighbors
            }
        }else{ bottomleft = {}}

        if (tempX > 1){
            const leftIdx = xyToIdx(tempX - 1, tempY, dim)
            var left = inLands[leftIdx]
            if ("neighbors" in left){
                delete left.neighbors
            }    
        }else{ left = {}}

        if (tempX > 1 && tempY < dim && tempIdx + dim - 1< inLands.length){
            const topleftIdx = xyToIdx(tempX - 1, tempY + 1, dim)
            var topleft = inLands[topleftIdx]
            if ("neighbors" in topleft){
                delete topleft.neighbors
            }
        }else{ topleft = {}}

        var neighbors = {
            "top": top,
            "topright": topright,
            "right": right,
            "bottomright": bottomright,
            "bottom": bottom,
            "bottomleft": bottomleft,
            "left": left,
            "topleft": topleft
        }

        inLands[i].neighbors = neighbors;
        
        if (i % 1000 == 0){
            console.log(inLands[i])
        }
    }
    
    return inLands
}    

function  updateLandTypeCounts(terraformsByLandType)  {
    var outArray = {
        "Artificial": terraformsByLandType.Artificial.length,
        "Badlands": terraformsByLandType.Badlands.length,
        "Desert": terraformsByLandType.Desert.length,
        "Fungal": terraformsByLandType.Fungal.length,
        "Grass": terraformsByLandType.Grass.length,
        "Prismatic": terraformsByLandType.Prismatic.length,
        "Rocky": terraformsByLandType.Rocky.length,
        "Tundra": terraformsByLandType.Tundra.length,
        "Volcanic": terraformsByLandType.Volcanic.length,
        "Wasteland": terraformsByLandType.Wasteland.length,
    }
    return outArray
}


function updateConstraints(tile, inType, constraints){
    var tileOptions = tile.possible_types
    var goodOptions = []
    
    var validConstraints = constraints[inType.toLowerCase()]
    tileOptions.forEach(type => {
        if (validConstraints.includes(type)){
            goodOptions.push(type)
        }
    })
    tile.possible_types = goodOptions
    return tile
}

function determineLowestState(inTiles){
    var minTiles = []
    var minState = 100
    inTiles.forEach(tile => {
        var state = tile.numOptions
        if (state > 0){
            if (state < minState){
            minState = state
            minTiles = []
            minTiles.push(tile)
            
            } else if (state = minState){
                minTiles.push(tile)
            }
        }
    })
    var lowestState = {
        "lowestState": minState,
        "lowestTiles": minTiles
    
    }
    return lowestState
}

//selects token from pool of common land type
function selectFromType(type, landPool){
    var typePool = landPool[type]
    var token = typePool[Math.floor(Math.random()*typePool.length)]
    return token
}

function propagateConstraints(inTile, inLands, dim, arrLen){
    var selectedX = inTile.location.x
    var selectedY = inTile.location.y
    var selectedIdx = xyToIdx(selectedX, selectedY, dim)

    if (selectedY > 1){
        const bottomIdx = xyToIdx(selectedX, selectedY - 1, dim)
        inLands[bottomIdx] = updateConstraints(inLands[bottomIdx], selectedType, constraints)
    }

    if (selectedX < dim && selectedY > 1){
        const bottomrightIdx = xyToIdx(selectedX + 1, selectedY - 1, dim)
        inLands[bottomrightIdx] = updateConstraints(inLands[bottomrightIdx], selectedType, constraints)
    }

    if (selectedX < dim && selectedIdx + 1< arrLen){
        const rightIdx = xyToIdx(selectedX + 1, selectedY, dim)
        inLands[rightIdx] = updateConstraints(inLands[rightIdx],selectedType, constraints)
    }

    if (selectedX < dim && (selectedY < dim && selectedIdx + dim + 1 < arrLen)){
        const toprightIdx = xyToIdx(selectedX + 1, selectedY + 1, dim)
        inLands[toprightIdx] = updateConstraints(inLands[toprightIdx], selectedType, constraints)
    }

    if (selectedY < dim && selectedIdx + dim < arrLen ){
        const topIdx = xyToIdx(selectedX, selectedY + 1, dim)
        inLands[topIdx] = updateConstraints(inLands[topIdx], selectedType, constraints)
    }

    if (selectedX > 1 && selectedY < dim && selectedIdx + dim - 1 < arrLen ){
        const topleftIdx = xyToIdx(selectedX - 1, selectedY + 1, dim)
        inLands[topleftIdx] = updateConstraints(inLands[topleftIdx], selectedType, constraints)
    }

    if (selectedX > 1){
        const leftIdx = xyToIdx(selectedX - 1, selectedY, dim)
        inLands[leftIdx] = updateConstraints(inLands[leftIdx], selectedType, constraints)
    }

    if (selectedX > 1 && selectedY > 1){
        const bottomleftIdx = xyToIdx(selectedX - 1, selectedY - 1, dim)
        inLands[bottomleftIdx] = updateConstraints(inLands[bottomleftIdx], selectedType, constraints)
    }

    return inLands
}
