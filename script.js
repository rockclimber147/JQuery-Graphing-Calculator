$(document).ready(function () {

    let canvas = $("#screen").get(0);
    let ctx = canvas.getContext("2d");

    let globalLiterals = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '(', ')', '.', '+', '-'];
    let displayLiterals = ['x', '÷'];
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
        'sqrt': "Math.sqrt("
    }

    var calculationArray = [[], [], 0];
    var functionArray1 = [[], [], 0];
    var functionArray2 = [[], [], 0];
    var functionArray3 = [[], [], 0];

    var inputArrays = [calculationArray, functionArray1, functionArray2, functionArray3];
    // Stores a reference to the array to edit
    var currentArray = calculationArray;

    $("button").click(function () {
        currentString = jQuery(this).text();
        console.log(currentString);

        // Math buttons are lowercase, navigation buttons aren't
        if (currentString[0] == currentString[0].toLowerCase()) {
            handleMathButtonInput(currentString, currentArray);
            console.log("Display", currentArray[0]);
            console.log("Eval", currentArray[1]);
            return;
        }

        switch (currentString) {
            case "ENTER": {
                console.log(eval(currentArray[1].join("")));
                break;
            } case "CLEAR": {
                clearArray(currentArray);
                break;
            } case "RESET": {
                resetAllArrays();
                break;
            } case "AXES": {
                console.log("TODO");
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
            }
        }


    });

    function handleMathButtonInput(buttonString, currentArray) {
        displayArray = currentArray[0];
        evalArray = currentArray[1];

        console.log(buttonString);

        if (globalLiterals.indexOf(buttonString) != -1) {
            displayArray.push(buttonString);
            evalArray.push(buttonString);
        } else if (displayLiterals.indexOf(buttonString) != -1) {
            displayArray.push(buttonString);
            evalArray.push(evalDict[buttonString]);
        } else {
            displayArray.push(displayDict[buttonString]);
            evalArray.push(evalDict[buttonString]);
        }
    }

    function resetAllArrays() {
        for (element of inputArrays) {
            clearArray(element);
        }
    }

    function clearArray(array){
        array[0].length = 0;
        array[1].length = 0;
        array[2] = 0;
    }
});

