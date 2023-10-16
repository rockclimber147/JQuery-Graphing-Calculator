$(document).ready(function () {

    let canvas = $("#screen").get(0);
    let ctx = canvas.getContext("2d");

    let globalLiterals = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '(', ')', '.', '+', '-'];
    let displayLiterals = ['x', '÷', 'ANS'];
    let displayDict = {
        'e^x': 'e^',
        'ln': "log(",
        'log10': 'log(',
        'sin': "sin(",
        'cos': "cos(",
        'tan': "tan(",
        'x^y': "^",
        'sqrt': "sqrt("
    }
    let evalDict = {
        'e^x':  'Math.E**',
        'ln': "Math.log(",
        'log10': 'Math.log10(',
        'sin': "Math.sin(",
        'cos': "Math.cos(",
        'tan': "Math.tan(",
        'x^y': "**",
        'x': "*",
        '÷': "/",
        'sqrt': "Math.sqrt(",
        'ANS': 'lastAnswerValue'
    }


    var lastAnswerValue = 0;

    var calculationArray = [['|'], [], 0];
    var functionArray1 = [['|'], [], 0];
    var functionArray2 = [['|'], [], 0];
    var functionArray3 = [['|'], [], 0];


    var inputArrays = [calculationArray, functionArray1, functionArray2, functionArray3];
    // Stores a reference to the array to edit
    var currentArray = calculationArray;

    $("button").click(function () {
        currentString = jQuery(this).text();
        currentClass = jQuery(this).attr('class');

        switch (currentClass){
            case 'nav_button':{
                handleNavButtonInput(jQuery(this).attr('id'));
                break;
            } case 'math_button':{
                handleMathButtonInput(currentString, currentArray);
                break;
            } case 'special_button':{
                handleSpecialButtonInput(currentString);
                break;
            }
        }
        log();
    });

    function handleNavButtonInput(buttonID){
        switch (buttonID){
            case 'left_button': {
                moveCursor(-1);
                break;
            } case 'right_button': {
                moveCursor(1);
                break;
            }
        }
    }

    
    function moveCursor(direction){
        // increment pointer and make sure it's within the bounds of the equation tokens array length (display token length will change)
        currentArray[2] += direction;
        if (currentArray[2] > currentArray[1].length) {
            currentArray[2] = currentArray[1].length;
        }
        if (currentArray[2] <= 0){
            currentArray[2] = 0;
        }
        // remove cursor
        currentArray[0].splice(currentArray[0].indexOf('|'), 1);
        // add cursor at new position
        currentArray[0].splice(currentArray[2], 0, '|');
    }

    function handleSpecialButtonInput(buttonContent){
        switch (buttonContent) {
            case "ENTER": {
                lastAnswerValue = eval(currentArray[1].join(""));
                break;
            } case "CLEAR": {
                clearArray(currentArray);
                break;
            } case "RESET": {
                resetAllArrays();
                break;
            } case "DEL": {
                deleteAtCursor();
                break;
            } case "SCROLL": {
                console.log("TODO");
                break;
            } case "GRAPH": {
                console.log("TODO");
                break;
            } case "F(X)": {
                console.log("TODO");
                break;
            } case "AXES": {
                console.log("TODO");
                break;
            }
        }
    }

    function deleteAtCursor(){
        index = currentArray[2];
        currentArray[0].splice(index + 1, 1);
        currentArray[1].splice(index , 1);
        moveCursor(0);
    }

    // put input where cursor is
    function handleMathButtonInput(buttonString, currentArray) {
        index = currentArray[2];
        displayArray = currentArray[0];
        evalArray = currentArray[1];
        let displayString = "";
        let evalString = "";

        if (globalLiterals.indexOf(buttonString) != -1) {
            displayString = buttonString;
            evalString = buttonString;
        } else if (displayLiterals.indexOf(buttonString) != -1) {
            displayString = buttonString;
            evalString = evalDict[buttonString];
        } else {
            displayString = displayDict[buttonString];
            evalString = evalDict[buttonString];
        }
        displayArray.splice(index + 1, 0, displayString)
        evalArray.splice(index, 0, evalString)
        moveCursor(1);
    }

    // Clearing arrays

    function resetAllArrays() {
        for (element of inputArrays) {
            clearArray(element);
        }
        lastAnswerValue = 0;
    }

    function clearArray(array){
        array[0].length = 0;
        array[0].push('|');
        array[1].length = 0;
        array[2] = 0;
    }

    function log(){
        console.log("\n");
        console.log("display array  : ", currentArray[0]);
        console.log("display string : ", currentArray[0].join(''));
        console.log("eval array     : ", currentArray[1]);
        console.log("eval string    : ", currentArray[1].join(''));
        console.log("lastAnswerValue:", lastAnswerValue);
    }
});