$(document).ready(function () {

    let canvas = $("#screen_canvas").get(0);
    jQuery(canvas).hide();
    let ctx = canvas.getContext("2d");
    ctx.font = "10px monospace";

    let screenTextDisplay = $('#screen_text').get(0);

    let calculatorDisplayWidth = $('#calculator').width();
    canvas.width = calculatorDisplayWidth;
    canvas.height = calculatorDisplayWidth * 0.75;

    let screenText = $('#screen_text');
    screenText.width(calculatorDisplayWidth);
    screenText.height(calculatorDisplayWidth * .75);

    // For converting input strings
    let globalLiterals = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '(', ')', '.', '+', '-', '*'];
    let displayLiterals = ['÷', 'ANS', 'π'];
    let displayDict = {
        'e^x': 'e^',
        'ln': "ln(",
        'sin': "sin(",
        'cos': "cos(",
        'tan': "tan(",
        'x^y': "^",
        'sqrt': "sqrt("
    }
    let evalDict = {
        'e^x': 'Math.E**',
        'ln': "Math.log(",
        'π': 'Math.PI',
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
    var graphXPointer = Math.round(canvas.width / 2);

    // currentArray points to calculationArray by default
    var currentArray = calculationArray;

    displayHome();

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
        switch (currentPage) {
            case 'SCROLL': {
                xSpan = axisValues[1] - axisValues[0];
                axisValues[0] += direction * xSpan / 10;
                axisValues[1] += direction * xSpan / 10;
                evaluateGraphs();
                displayGraphs();
                return;
            } case 'GRAPH': {
                graphXPointer = (graphXPointer + direction + canvas.width) % canvas.width;
                return;
            } default: {
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
        }
    }

    function moveVerticalCursor(direction) {
        switch (currentPage) {
            case 'F(X)': {
                functionArrayIndex = (functionArrayIndex + direction + functionArrays.length) % functionArrays.length;
                currentArray = functionArrays[functionArrayIndex];
                displayFunctions();
                break;
            } case 'AXES': {
                axisArrayIndex = (axisArrayIndex + direction + axisArrays.length) % axisArrays.length;
                currentArray = axisArrays[axisArrayIndex];
                break;
            } case 'SCROLL': {
                ySpan = axisValues[2] - axisValues[3];
                axisValues[2] += direction * ySpan / 10;
                axisValues[3] += direction * ySpan / 10;
                evaluateGraphs();
                displayGraphs();
                break;
            } case 'GRAPH': {
                functionArrayIndex = (functionArrayIndex + direction + functionArrays.length) % functionArrays.length;
                break;
            }
        }
    }

    function showCanvas() {
        jQuery(canvas).show();
        jQuery(screenTextDisplay).hide();
    }

    function showScreenText() {
        jQuery(screenTextDisplay).show();
        jQuery(canvas).hide();
    }

    function navigateTo(page) {
        // set buttons to dark gray
        $('.nav_button').each(function () {
            $(this).css("background-color", "darkgray");
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
                    showScreenText();
                    currentPage = 'F(X)';
                    currentArray = functionArrays[functionArrayIndex];
                    break;
                } case 'AXES': {
                    showScreenText();
                    currentPage = 'AXES';
                    currentArray = axisArrays[axisArrayIndex];
                    break;
                } case 'GRAPH': {
                    showCanvas();
                    currentPage = 'GRAPH';
                    evaluateGraphs();
                    break;
                } case 'SCROLL': {
                    showCanvas();
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
                handleXVarInput();
            }
        }
    }

    function handleXVarInput() {
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

        if (currentPage == 'SCROLL') {
            zoomScroll(-1);
            return;
        }
        index = currentArray[2];
        currentArray[0].splice(index + 1, 1);
        currentArray[1].splice(index, 1);
        moveHorizontalCursor(0);
    }

    function hitEnter() {
        switch (currentPage) {
            case "HOME": {
                lastAnswerValue = safeEval(currentArray[1].join(""));
                break;
            } case 'AXES': {
                value = safeEval(currentArray[1].join(""));
                if (value != undefined && isFinite(value)) {
                    axisValues[axisArrayIndex] = value;
                }
                validateAxes();
                break;
            } case 'SCROLL': {
                zoomScroll(1);
                break;
            }
        }
    }

    function validateAxes(){
        if (axisValues[1] < axisValues[0]){
            temp = axisValues[0];
            axisValues[0] = axisValues[1];
            axisValues[1] = temp;
        }
        if (axisValues[3] < axisValues[2]){
            temp = axisValues[2];
            axisValues[2] = axisValues[3];
            axisValues[3] = temp;
        }
    }

    function zoomScroll(direction) {
        xStep = (axisValues[1] - axisValues[0]) / 5;
        yStep = (axisValues[3] - axisValues[2]) / 5;

        axisValues[0] += direction * xStep;
        axisValues[1] -= direction * xStep;

        axisValues[2] += direction * yStep;
        axisValues[3] -= direction * yStep;

        evaluateGraphs();
        displayGraphs();
    }

    function handleMathButtonInput(buttonString, currentArray) {
        if (currentPage == 'SCROLL' || currentPage == 'GRAPH'){
            return;
        }
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

    function evaluateGraphs() {
        // for each function array
        for (i = 0; i < functionArrays.length; i += 1) {
            evalString = functionArrays[i][1].join('');
            // evalString = 'Math.sin(x)';
            xStep = (axisValues[1] - axisValues[0]) / canvas.width;
            graphIndex = 0;
            // evaluate the corresponding graph
            for (x = axisValues[0]; x < axisValues[1]; x += xStep) {
                graphs[i][graphIndex] = safeEval(evalString);
                graphIndex += 1;
            }
        }
    }

    // Display

    function updateDisplay() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        switch (currentPage) {
            case 'HOME': {
                displayHome();
                break;
            } case 'F(X)': {
                displayFunctions();
                break;
            } case 'AXES': {
                displayAxisText();
                break;
            } case 'GRAPH': {
                displayGraphs();
                break;
            } case 'SCROLL': {
                displayGraphs();
                displayScrollOverlay();
                break;
            }
        }
    }
    function displayScrollOverlay() {
        // left
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(10, canvas.height / 2 - 10);
        ctx.lineTo(10, canvas.height / 2 + 10);
        ctx.lineTo(0, canvas.height / 2);
        ctx.fill();

        // right
        ctx.beginPath();
        ctx.moveTo(canvas.width, canvas.height / 2);
        ctx.lineTo(canvas.width - 10, canvas.height / 2 - 10);
        ctx.lineTo(canvas.width - 10, canvas.height / 2 + 10);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.fill();

        // up
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2 - 10, 10);
        ctx.lineTo(canvas.width / 2 + 10, 10);
        ctx.lineTo(canvas.width / 2, 0);
        ctx.fill();

        // down
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, canvas.height);
        ctx.lineTo(canvas.width / 2 - 10, canvas.height - 10);
        ctx.lineTo(canvas.width / 2 + 10, canvas.height - 10);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.fill();

        ctx.strokeStyle = 'black';
        ctx.strokeText('Zoom In: ENTER', canvas.width - 100, 10)
        ctx.strokeText('Zoom Out: DEL', canvas.width - 100, 20)
    }

    function displayHome() {
        jQuery(screenTextDisplay).removeClass();
        jQuery(screenTextDisplay).addClass('black');
        jQuery(screenTextDisplay).empty();
        jQuery(screenTextDisplay).append(currentArray[0].join(''));
        jQuery(screenTextDisplay).append(`<p style="text-align:right;">
        Last Answer: ${lastAnswerValue}
        </p>`);
    }

    function displayAxisText() {
        jQuery(screenTextDisplay).removeClass();
        jQuery(screenTextDisplay).addClass('black');
        jQuery(screenTextDisplay).empty();
        currentAxis = '';
        switch (axisArrayIndex) {
            case 0: {
                currentAxis = 'xMin';
                break;
            } case 1: {
                currentAxis = 'xMax';
                break;
            } case 2: {
                currentAxis = 'yMin';
                break;
            } case 3: {
                currentAxis = 'yMax';
                break;
            }
        }

        jQuery(screenTextDisplay).append(`<div>xMin: ${axisValues[0]}</div>`);
        jQuery(screenTextDisplay).append(`<div>xMax: ${axisValues[1]}</div>`);
        jQuery(screenTextDisplay).append(`<div>yMin: ${axisValues[2]}</div>`);
        jQuery(screenTextDisplay).append(`<div>xMax: ${axisValues[3]}</div>`);

        jQuery(screenTextDisplay).append(`<p>${currentAxis}: ${currentArray[0].join("")}</p>`);
    }

    function displayFunctions() {
        jQuery(screenTextDisplay).removeClass();
        switch (functionArrayIndex) {
            case 0: {
                jQuery(screenTextDisplay).addClass('red');
                jQuery(screenTextDisplay).text('F1: ' + currentArray[0].join(''))
                break;
            } case 1: {
                jQuery(screenTextDisplay).addClass('green');
                jQuery(screenTextDisplay).text('F2: ' + currentArray[0].join(''))
                break;
            } case 2: {
                jQuery(screenTextDisplay).addClass('blue');
                jQuery(screenTextDisplay).text('F3: ' + currentArray[0].join(''))
                break;
            }
        }
    }

    function displayGraphs() {
        displayAxes();
        for (i = 0; i < graphs.length; i++) {
            switch (i) {
                case 0: {
                    ctx.strokeStyle = 'red';
                    ctx.strokeText('F1:' + functionArray1[0].join('').replace('>', ""), 0, 10)
                    break;
                } case 1: {
                    ctx.strokeStyle = 'green';
                    ctx.strokeText('F2:' + functionArray2[0].join('').replace('>', ""), 0, 20)
                    break;
                } case 2: {
                    ctx.strokeStyle = 'blue';
                    ctx.strokeText('F3:' + functionArray3[0].join('').replace('>', ""), 0, 30)
                    break;
                }
            }
            if (!graphs[i].includes(undefined)) {
                displayGraph(graphs[i]);
            }
        }
        switch (functionArrayIndex) {
            case 0: {
                ctx.strokeStyle = 'red';
                break;
            } case 1: {
                ctx.strokeStyle = 'green';
                break;
            } case 2: {
                ctx.strokeStyle = 'blue';
                break;
            }
        }
        ctx.strokeText('X', graphXPointer - 4, getYCoord(graphs[functionArrayIndex][graphXPointer]) + 3);
        ctx.strokeText('F' + (functionArrayIndex + 1), 2, canvas.height - 30)
        ctx.strokeText("x:" + (axisValues[0] + (axisValues[1] - axisValues[0])*(graphXPointer / canvas.width)), 2, canvas.height - 20)
        ctx.strokeText("y:" + graphs[functionArrayIndex][graphXPointer], 2, canvas.height - 10)
    }

    function displayGraph(graphArray) {
        ctx.beginPath();
        ctx.moveTo(0, getYCoord(graphArray[0]));
        pixel = 0;
        for (value of graphArray) {
            ctx.lineTo(pixel, getYCoord(value));
            pixel += 1;
        }
        ctx.stroke();
    }

    function displayAxes() {
        // Y axis
        // if x== 0 is in domain
        ctx.strokeStyle = 'black';
        if (axisValues[0] <= 0 && axisValues[1] >= 0) {

            xSpan = axisValues[1] - axisValues[0];
            zeroPosition = -axisValues[0] / xSpan * canvas.width;
            ctx.beginPath();
            ctx.moveTo(zeroPosition, 0);
            ctx.lineTo(zeroPosition, canvas.height);
            ctx.stroke();
        }
        if (axisValues[2] <= 0 && axisValues[3] >= 0) {
            zeroPosition = getYCoord(0);
            ctx.beginPath();
            ctx.moveTo(0, zeroPosition);
            ctx.lineTo(canvas.width, zeroPosition);
            ctx.stroke();
        }

        ctx.strokeText('Xmin: ' + formatAxisValueSciNotation(axisValues[0]), canvas.width - 100, canvas.height - 35);
        ctx.strokeText('Xmax: ' + formatAxisValueSciNotation(axisValues[1]), canvas.width - 100, canvas.height - 25);
        ctx.strokeText('Ymin: ' + formatAxisValueSciNotation(axisValues[2]), canvas.width - 100, canvas.height - 15);
        ctx.strokeText('Ymax: ' + formatAxisValueSciNotation(axisValues[3]), canvas.width - 100, canvas.height - 5);
    }

    function formatAxisValueSciNotation(value) {
        stringVal = value.toExponential();
        stringVal = stringVal.split('e');
        if (!stringVal[0].includes('.')) {
            stringVal[0] += '.';
        }
        stringVal[0] += '000';
        stringVal[0] = stringVal[0].substring(0, 5);
        return stringVal.join('*10^');
    }

    function getYCoord(actualY) {
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
        graphXPointer = Math.round(canvas.width / 2);
        evaluateGraphs();
    }

    function clearArray(array) {
        array[0].length = 0;
        array[0].push('>');
        array[1].length = 0;
        array[2] = 0;
    }

    function safeEval(toEval) {
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
        console.log("Current page: ", currentPage);
        console.log();
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