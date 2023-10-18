$(document).ready(function () {

    let canvas = $("#screen").get(0);
    let ctx = canvas.getContext("2d");

    // For converting input strings
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
        'e^x': 'Math.E**',
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
    var calculationArray = [['>'], [], 0];
    var currentPage = 'HOME';

    // F(X) page
    var functionArray1 = [['>'], [], 0];
    var functionArray2 = [['>'], [], 0];
    var functionArray3 = [['>'], [], 0];

    var functionArrays = [functionArray1, functionArray2, functionArray3];
    var functionArrayIndex = 0;

    // AXES page
    var minX = [['>'], [], 0];
    var maxX = [['>'], [], 0];
    var minY = [['>'], [], 0];
    var maxY = [['>'], [], 0];

    var axisArrays = [minX, maxX, minY, maxY];
    var axisArrayIndex = 0;

    // currentArray points to calculationArray by default
    var currentArray = calculationArray;

    $("button").click(function () {
        currentString = jQuery(this).text();
        currentClass = jQuery(this).attr('class');

        switch (currentClass) {
            case 'direction_button': {
                handleDirectionButtonInput(jQuery(this).attr('id'));
                break;
            } case 'math_button': {
                handleMathButtonInput(currentString, currentArray);
                break;
            } case 'special_button': {
                handleSpecialButtonInput(currentString);
                break;
            } case 'nav_button': {
                navigateTo(currentString);
            }
        }
        log();
    });

    function handleDirectionButtonInput(buttonID) {
        switch (buttonID) {
            case 'left_button': {
                moveHorizontalCursor(-1);
                break;
            } case 'right_button': {
                moveHorizontalCursor(1);
                break;
            }
        }
    }

    function navigateTo(page) {
        // set buttons to darkgrey
        $('.nav_button').each(function () {
            $(this).css("background-color", "darkgrey");
        });
        if (currentPage == page) {
            currentPage = 'HOME';
            currentArray = calculationArray;
        } else {
            $('button:contains(' + page + ')').css('background-color', 'yellow');
            switch (page) {
                case 'F(X)': {
                    currentPage = 'F(X)'
                    break;
                } case 'AXES': {
                    currentPage = 'AXES';
                    break;
                } case 'GRAPH': {
                    currentPage = 'GRAPH';
                    break;
                } case 'SCROLL': {
                    currentPage = 'SCROLL';
                    break;
                }
            }
        }
    }

    function moveHorizontalCursor(direction) {
        // increment pointer and make sure it's within the bounds of the equation tokens array length (display token length will change)
        currentArray[2] += direction;
        if (currentArray[2] > currentArray[1].length) {
            currentArray[2] = currentArray[1].length;
        }
        if (currentArray[2] <= 0) {
            currentArray[2] = 0;
        }
        // remove cursor
        currentArray[0].splice(currentArray[0].indexOf('>'), 1);
        // add cursor at new position
        currentArray[0].splice(currentArray[2], 0, '>');
    }

    function handleSpecialButtonInput(buttonContent) {
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
            } case 'X': {
                handleXvarInput();
            }
        }
    }

    function handleXvarInput(){
        if (currentPage != 'F(X)'){
            return;
        }
        index = currentArray[2];
        displayArray = currentArray[0];
        evalArray = currentArray[1];
        displayArray.splice(index + 1, 0, 'x')
        evalArray.splice(index, 0, 'x')
        moveCursor(1);
    }

    function deleteAtCursor() {
        index = currentArray[2];
        currentArray[0].splice(index + 1, 1);
        currentArray[1].splice(index, 1);
        moveCursor(0);
    }

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
        clearArray(calculationArray);
        for (element of functionArrays) {
            clearArray(element);
        }
        lastAnswerValue = 0;
    }

    function clearArray(array) {
        array[0].length = 0;
        array[0].push('>');
        array[1].length = 0;
        array[2] = 0;
    }

    // console logging

    function log() {
        console.log("\n");
        console.log(currentPage);
        console.log("display array  : ", currentArray[0]);
        console.log("display string : ", currentArray[0].join(''));
        console.log("eval array     : ", currentArray[1]);
        console.log("eval string    : ", currentArray[1].join(''));
        console.log("lastAnswerValue:", lastAnswerValue);
    }
});