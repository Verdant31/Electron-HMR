import pandas as pd
import HandTrackingModule as htm
from pickle import load
from tensorflow import keras
import numpy as np
import cv2
alfabeto = ['A', 'B', 'None']

modelo = keras.models.load_model(
    'C:/Users/Administrador/Desktop/react-hmr/code/model.h5')
normalizer = load(
    open('C:/Users/Administrador/Desktop/react-hmr/code/normalizerModel.pkl', 'rb'))
detector = htm.handDetector()
cap = cv2.VideoCapture(0)


formattedLm = []
rightMovesCounter = 0
moveStarted = False
moveSymbol = ""
moveFinished = False

leftVariation = []
rightVariation = []
upVariation = []
downVariation = []
direction = ""


def compare(lmList, cropped):
    imageHeight = cropped.shape[0]
    imageWidth = cropped.shape[1]
    comparisons = []
    for i, lm in enumerate(lmList):
        currentLmComparison = []
        for index in range(len(lmList)):
            if index == len(lmList):
                break
            if lmList[i][0] == lmList[index][0]:
                continue
            comparisonX = round(
                abs(((lmList[index][1] - lmList[i][1]) * 100) / imageWidth), 2)
            comparisonY = round(
                abs(((lmList[i][2] - lmList[index][2]) * 100) / imageHeight), 2)
            currentLmComparison.append(
                [lmList[i][0], lmList[index][0], comparisonX, comparisonY])
        comparisons.append(currentLmComparison)
    formattedLm = []
    for comparison in comparisons:
        for lm in comparison:
            formattedLm.append(lm[2])
            formattedLm.append(lm[3])
    return formattedLm


while True:
    success, img = cap.read()
    img = detector.findHands(img, draw=True)
    sizes = detector.getNewSizes(img)
    cropped = img[sizes[0]:sizes[1], sizes[3]:sizes[2]]
    k = cv2.waitKey(1)

    if(cropped.shape[0] > 0 and cropped.shape[1] > 0 and not moveStarted):
        lmList = detector.findPosition(cropped, draw=False)
        formattedLm = compare(lmList, cropped)
        x_normalized = pd.DataFrame(formattedLm).transpose()
        x_normalized = normalizer.transform(x_normalized)
        predict = modelo.predict(x_normalized, verbose=0)
        cv2.putText(img, alfabeto[int(np.argmax(predict))],
                    (10, 70), cv2.FONT_HERSHEY_PLAIN, 3, (255, 0, 255), 3)
        cv2.putText(img, 'Acc: ' + str(predict[0][np.argmax(predict)]),
                    (130, 70), cv2.FONT_HERSHEY_PLAIN, 3, (255, 0, 255), 3)

        if(predict[0][np.argmax(predict)] > 0.98 and int(np.argmax(predict)) < 2):
            rightMovesCounter += 1
            if(rightMovesCounter > 30):
                moveStarted = True
                moveSymbol = alfabeto[int(np.argmax(predict))]

    elif(cropped.shape[0] > 0 and cropped.shape[1] > 0 and moveStarted and not moveFinished):
        cv2.putText(img, "Comece o movimento." + direction,
                    (10, 70), cv2.FONT_HERSHEY_PLAIN, 3, (255, 0, 255))
        lmList = detector.findPosition(cropped, draw=False)
        formattedLm = compare(lmList, cropped)
        x_normalized = pd.DataFrame(formattedLm).transpose()
        x_normalized = normalizer.transform(x_normalized)
        predict = modelo.predict(x_normalized, verbose=0)
        if(alfabeto[int(np.argmax(predict))] == moveSymbol):
            for id, lm in enumerate(lmList):
                if(id == 12):
                    upVariation.append(lm[2])
                if(id == 0):
                    downVariation.append(lm[2])
                if(id == 20):
                    rightVariation.append(lm[1])
                if(id == 4):
                    leftVariation.append(lm[1])
        if(alfabeto[int(np.argmax(predict))] == "Nop"):
            moveFinished = True
    elif(((not cropped.shape[0] > 0 and not cropped.shape[1]) or moveFinished) > 0 and moveStarted):
        moveStarted = False
        topInterval = max(upVariation) - min(upVariation)
        bottomInterval = max(downVariation) - min(downVariation)
        rightInterval = max(rightVariation) - min(rightVariation)
        leftInterval = max(leftVariation) - min(leftVariation)

        if((upVariation[0] > upVariation[-1] and downVariation[0] > downVariation[-1]) and topInterval > rightInterval and topInterval > leftInterval):
            direction = "cima"
        elif((upVariation[0] < upVariation[-1] and downVariation[0] < downVariation[-1]) and bottomInterval > rightInterval and bottomInterval > leftInterval):
            direction = "baixo"
        elif(rightInterval > topInterval and rightInterval > bottomInterval and rightInterval > leftInterval):
            direction = "direita"
        elif(leftInterval > topInterval and leftInterval > bottomInterval and leftInterval > rightInterval):
            direction = "esquerda"

        print("O simbolo do movimento foi: " +
              moveSymbol + " para " + direction)
        rightMovesCounter = 0
        moveStarted = False
        moveFinished = False

        leftVariation = []
        rightVariation = []
        upVariation = []
        downVariation = []
        rightMovesCounter = 0
    else:
        rightMovesCounter = 0
    if k % 256 == 27:
        break
    cv2.imshow("Image", img)

cap.release()
cv2.destroyAllWindows()
