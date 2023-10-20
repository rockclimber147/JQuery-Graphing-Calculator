$(document).ready(function () {

    let canvas = $("#screen").get(0);
    var ctx = canvas.getContext("2d");

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
    
    var currentPage = 'HOME';

    var lastAnswerValue = 0;
    var calculationArray = [['>'], [], 0];
    // store trash inputs
    var garbageArray = [['>'], [], 0];
    

    // F(X) page
    var functionArray1 = [['>'], [], 0];
    var functionArray2 = [['>'], [], 0];
    var functionArray3 = [['>'], [], 0];
    var functionArrays = [functionArray1, functionArray2, functionArray3];
    var functionArrayIndex = 0;

    var x = 0;

    // AXES page
    var minX = [['>'], [], 0];
    var maxX = [['>'], [], 0];
    var minY = [['>'], [], 0];
    var maxY = [['>'], [], 0];

    var axisArrays = [minX, maxX, minY, maxY];
    var axisValues = [-10, 10, -10, 10];
    var axisArrayIndex = 0;

    // GRAPH page
    var f1Values = Array(canvas.width).fill(0);
    var f2Values = Array(canvas.width).fill(0);
    var f3Values = Array(canvas.width).fill(0);
    var graphs = [f1Values, f2Values, f3Values];
    var graphArrayIndex = 0;
    var graphXPointer = 0;

    // currentArray points to calculationArray by default
    var currentArray = calculationArray;

    // button press handling
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
        updateDisplay();
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
            } case 'up_button': {
                moveVerticalCursor(1);
                break;
            } case 'down_button': {
                moveVerticalCursor(-1);
                break;
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

    function moveVerticalCursor(direction){
        switch (currentPage) {
            case 'F(X)' : {
                functionArrayIndex = (functionArrayIndex + direction + functionArrays.length) % functionArrays.length;
                currentArray = functionArrays[functionArrayIndex];
                break;
            } case 'AXES' : {
                axisArrayIndex = (axisArrayIndex + direction + axisArrays.length) % axisArrays.length;
                currentArray = axisArrays[axisArrayIndex];
                break;
            } case 'SCROLL' : {
                // TODO
            }
        }
    }

    function navigateTo(page) {
        // set buttons to darkgrey
        $('.nav_button').each(function () {
            $(this).css("background-color", "darkgrey");
        });
        // on double tap, go HOME
        if (currentPage == page) {
            currentPage = 'HOME';
            currentArray = calculationArray;
        } else {
            // Change button background to yellow
            $('button:contains(' + page + ')').css('background-color', 'yellow');
            switch (page) {
                case 'F(X)': {
                    currentPage = 'F(X)';
                    currentArray = functionArrays[functionArrayIndex];
                    break;
                } case 'AXES': {
                    currentPage = 'AXES';
                    currentArray = axisArrays[axisArrayIndex];
                    break;
                } case 'GRAPH': {
                    currentPage = 'GRAPH';
                    evaluateGraphs();
                    break;
                } case 'SCROLL': {
                    currentPage = 'SCROLL';
                    break;
                }
            }
        }
    }

    function handleSpecialButtonInput(buttonContent) {
        switch (buttonContent) {
            case "ENTER": {
                hitEnter();
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

    function handleXvarInput() {
        if (currentPage != 'F(X)') {
            return;
        }
        index = currentArray[2];
        displayArray = currentArray[0];
        evalArray = currentArray[1];
        displayArray.splice(index + 1, 0, 'x')
        evalArray.splice(index, 0, 'x')
        moveHorizontalCursor(1);
    }

    function deleteAtCursor() {
        index = currentArray[2];
        currentArray[0].splice(index + 1, 1);
        currentArray[1].splice(index, 1);
        moveHorizontalCursor(0);
    }

    function hitEnter(){
        switch (currentPage) {
            case "HOME" : {
                lastAnswerValue = safeEval(currentArray[1].join(""));
                break;
            } case 'AXES' : {
                axisValues[axisArrayIndex] = safeEval(currentArray[1].join(""));
                break;
            }
        }
    }

    function handleMathButtonInput(buttonString, currentArray) {
        index = currentArray[2];
        displayArray = currentArray[0];
        evalArray = currentArray[1];
        let displayString = "";
        let evalString = "";

        // Translate input to appropriate strings
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

        // Place translated token at cursor
        displayArray.splice(index + 1, 0, displayString);
        evalArray.splice(index, 0, evalString);
        moveHorizontalCursor(1);
    }
    // Graphing

    function evaluateGraphs(){
        // for each function array
        for (i = 0; i < functionArrays.length; i += 1) {
            // evalString = functionArrays[i][1].join('');
            // evalString = 'Math.sin(x)';
            if (i == 0){
                evalString = 'x ** 2 - 5';
            } else {
                evalString = 'Math.sin(x)';
            }
            xStep = (axisValues[1] - axisValues[0]) / canvas.width;
            console.log(xStep);
            graphIndex = 0;
            // evaluate the correspondng graph
            for (x = axisValues[0]; x < axisValues[1]; x += xStep){
                graphs[i][graphIndex] = safeEval(evalString);
                graphIndex += 1;
                console.log(x);
            }
            console.log(graphs[i]);
        }
    }
    evaluateGraphs();
    displayGraphs();

    // Display

    function updateDisplay() {
        switch (currentPage){
            case 'HOME' : {
                displayHome();
                break;
            } case 'F(X)' : {
                break;
            } case 'AXES' : {
                break;
            } case 'GRAPH' : {
                displayGraphs();
                break;
            } case 'SCROLL' : {
                break;
            }
        }
    }

    function displayHome(){
        // TODO
    }

    function displayGraphs(){
        for (graph of graphs){
            // if (graph.find(undefined) != undefined){
            displayGraph(graph);
            // }
        }
    }

    function displayGraph(graphArray){
        ctx.beginPath();
        ctx.moveTo(0, getYCoord(graphArray[0]));
        pixel = 0;
        for (value of graphArray){
            ctx.lineTo(pixel, getYCoord(value));
            pixel += 1;
        }
        ctx.stroke();
    }

    function getYCoord(actualY){
        yMin = axisValues[2];
        yMax = axisValues[3];
        // Y increases in the negative direction so invert the ign of the span
        ySpan = yMin - yMax;
        scaledY = actualY / ySpan * canvas.height;
        offsetY = yMin / ySpan * canvas.height;
        return scaledY + offsetY;
    }

    // Clearing arrays
    function resetAllArrays() {
        clearArray(calculationArray);
        for (element of functionArrays) {
            clearArray(element);
        }
        for (element of axisArrays) {
            clearArray(element);
        }
        lastAnswerValue = 0;
        // reset axes
        axisValues = [-10, 10, -10, 10];
    }

    function clearArray(array) {
        array[0].length = 0;
        array[0].push('>');
        array[1].length = 0;
        array[2] = 0;
    }

    function safeEval(toEval){
        try {
            result = eval(toEval);
            return result;
        } catch (error) {
            return undefined;
        }
    }

    // console logging

    function log() {
        console.log("\n");
        console.log("canvas width: ", canvas.width);
        console.log("canvas height: ", canvas.height);
        console.log(currentPage);
        console.log("display array  : ", currentArray[0]);
        console.log("display string : ", currentArray[0].join(''));
        console.log("eval array     : ", currentArray[1]);
        console.log("eval string    : ", currentArray[1].join(''));
        console.log("lastAnswerValue:", lastAnswerValue);
        console.log('\n');
        console.log('function arrays: ', functionArrays);
        console.log('function array index: ', functionArrayIndex);
        console.log('\n');
        console.log('axis arrays: ', axisArrays);
        console.log('axis array index: ', axisArrayIndex);
        console.log('axes [x0, x1, y0, y1]: ', axisValues);
    }
    
});