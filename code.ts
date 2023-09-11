// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs such as the network by creating a UI which contains
// a full browser environment (see documentation).

// Runs this code if the plugin is run in Figma
if (figma.editorType === "figma") {

  // Skip over invisible nodes and their descendants inside instances for faster performance
  figma.skipInvisibleInstanceChildren = true

//GETS "~random" COLOR PALETTE

  // gets all Paint Style from the figma document
  const paintStyles = figma.getLocalPaintStyles();

//GETS TOTAL COLOR PALETTE

  // creates palette array of just the style IDs
  let styleIds = paintStyles.map(style =>
    style.id);

//GETS ALL SELECTED NODES & THEIR CHILDREN

  // create array to store all selected nodes
  const allNodes = []
  // gets all parent notes from current selection
  const parentNodes = figma.currentPage.selection;
  // single out 1 parentNode of current selection
  for (const parentNode of parentNodes) {
    // send it to allNodes array
    if (parentNode.type != 
      "CODE_BLOCK" ||
      "CONNECTOR" ||
      "DOCUMENT" ||
      "EMBED" ||
      "GROUP" ||
      "LINK_UNFURL" ||
      "MEDIA" ||
      "PAGE" ||
      "SLICE" ||
      "WIDGET") {
      allNodes.push(parentNode);
    }
    // check if there are children
    if ("children" in parentNode) {
      // if so, get all children of parentNode
      const childNodes = parentNode.findAll();
      // single out 1 childNode of current selection
      for (const childNode of childNodes) {
        // send it to allNodes array
        if (childNode.type != 
          "CODE_BLOCK" ||
          "CONNECTOR" ||
          "DOCUMENT" ||
          "EMBED" ||
          "GROUP" ||
          "LINK_UNFURL" ||
          "MEDIA" ||
          "PAGE" ||
          "SLICE" ||
          "WIDGET") {
          allNodes.push(childNode);
        }
      }
    }   
  }

//SORTING CODE

// create array to store all selected nodes
const nodeCoords = []
//loop through selected nodes
for (let i = 0; i <= allNodes.length; i++) {
  const oneNode = allNodes[i];
  //checks that each node is not undefined and has a fill
  if (oneNode != undefined && oneNode.fills.length != 0) {
    //creates an object with node id, x, and y coordinates
    let nodeObject = { 
      nodeid: oneNode.id, 
      xcoord: (oneNode.x + (oneNode.width / 2)),
      ycoord: (oneNode.y + (oneNode.height / 2)) 
    }
  

    //checks if node has a parent
    if (oneNode.parent) {
      //creates a loop to account for infinite nesting of parent/child nodes
      for (let n = oneNode; n.parent; n = n.parent) {
        //checks that the parent is not the page
        if (n.parent.type === 'PAGE') {
          break
        }
        //creates an object to store the parent node id, x, and y coordinates
        else {
        let parentObject = {
          nodeid: n.parent.id, 
          xcoord: n.parent.x,
          ycoord: n.parent.y 
        }
        //adds or subtracts the coordinates to create accurate ordering of nodes
        if (parentObject.xcoord >= 0) {nodeObject["xcoord"] = nodeObject.xcoord + parentObject.xcoord;}
        else {nodeObject["xcoord"] = nodeObject.xcoord - parentObject.xcoord;}
        if (parentObject.ycoord >= 0) {nodeObject["ycoord"] = nodeObject.ycoord + parentObject.ycoord;}
        else {nodeObject["ycoord"] = nodeObject.ycoord - parentObject.ycoord;}
        }
      }  
    }
    //pushes node to new ordered object array
    nodeCoords.push(nodeObject);
  }

}
//sorts array using x and y coordinate values from top to bottom, left to right
function sortByPosition(a, b){
  if (a.ycoord == b.ycoord) return a.xcoord - b.xcoord;
  return a.ycoord - b.ycoord;
}
nodeCoords.sort(sortByPosition);

//converts sorted objects back to nodes and push to new array "sortedNodes"
const sortedNodes = [];
for (const sortedNode of nodeCoords) {
  sortedNodes.push(figma.getNodeById(sortedNode.nodeid));
}

//checks that each node doesn't have an image or video fill
for (let i = 0; i <= sortedNodes.length; i++) {
  const oneNode = sortedNodes[i];
  if (oneNode != undefined) {
    for (let x = 0; x < oneNode.fills.length; x++) {
      const oneFill = oneNode.fills[x];
      //if it does, slice it from the original array
      if (oneFill.type === "IMAGE") {
        sortedNodes.splice(i, 1);
        i--
      }
      if (oneFill.type === "VIDEO") {
        sortedNodes.splice(i, 1);
        i--
      }
    }
    //Custom naming override to pass over anything with an asterisk in the name
    if (oneNode.name.includes('*')) {
      sortedNodes.splice(i, 1);
          i--
    }
  }
}

//FILLS WITH RANDOM COLOR FROM PALETTE
 
  // creates an error if no color styles defines
  if (paintStyles.length != 0){
    // defines i to +1 to node array # with each loop
    for (let i = 0; i <= sortedNodes.length; i++) {
      const oneNode = sortedNodes[i];
      if (oneNode != undefined && oneNode.fills.length != 0 || undefined) {
        // gets styleIds from Figma color styles and fill node using modulo to create ordered pattern
        oneNode.fillStyleId = styleIds[i % styleIds.length];
      }
    }
  }

  else {
    figma.notify('No color styles found in document.', {timeout: 5000, error: true});
    }

  // creates an error if nothing is selected
  if (figma.currentPage.selection.length === 0) {
    figma.notify('Nothing selected.', {timeout: 5000, error: true});
  }
    
// Make sure to close the plugin when you're done. Otherwise the plugin will
// keep running, which shows the cancel button at the bottom of the screen.
figma.closePlugin();
}

