const templateReducer = (templateElements = [], action) => {
  if (action.type === 'addElements'){
    let element = {}
    if(action.elementType === "text"){
      element = {
        size: {width: 200, height: "unset"},
        position: {x:0, y:0},
        value: "",
        style:{
          bold: false,
          italic: false,
          underline: false,
          color: "black",
          fontSize: 14
        }
      }
    }else if(action.elementType === "image"){
      element = {
        size: {width: 200, height: 200},
        position: {x:0, y:0}
      }
    }

    return [...templateElements, {
      type: action.elementType,
      element

    }];
  }else if(action.type === 'updateElement'){
    const newList = [...templateElements]
    newList.splice(action.index, 1, {
      type: action.elementType,
      element: action.element
    })
    return newList
  }else if(action.type === 'deleteElement'){
    const newList = [...templateElements]
    newList.splice(action.index, 1)
    return newList
  } else {
    return templateElements;
  }
}

export default templateReducer