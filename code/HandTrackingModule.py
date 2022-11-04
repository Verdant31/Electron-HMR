from turtle import left
import cv2
import mediapipe as mp
from PIL import ImageEnhance
from PIL import Image
import numpy as np


class handDetector():
    def __init__(self, mode=False, maxHands=2, detectionCon=0.5, trackCon=0.5, modelComp=1):
        self.modelComp = modelComp
        self.mode = mode
        self.maxHands = maxHands
        self.detectionCon = detectionCon
        self.trackCon = trackCon

        self.mpHands = mp.solutions.hands
        self.hands = self.mpHands.Hands(
            self.mode, self.maxHands, self.modelComp, self.detectionCon, self.trackCon)
        self.mpDraw = mp.solutions.drawing_utils

    def findHands(self, img, draw=True):
        imgRGB = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        self.results = self.hands.process(imgRGB)
        if self.results.multi_hand_landmarks:
            for handLms in self.results.multi_hand_landmarks:
                if draw:
                    self.mpDraw.draw_landmarks(img, handLms,
                                               self.mpHands.HAND_CONNECTIONS)

        return img

    def findPosition(self, img, handNo=0, draw=True):
        lmList = []
        if self.results.multi_hand_landmarks:
            myHand = self.results.multi_hand_landmarks[handNo]
            for id, lm in enumerate(myHand.landmark):
                h, w, c = img.shape
                cx, cy = int(lm.x * w), int(lm.y * h)
                lmList.append([id, cx, cy])
                if draw:
                    cv2.circle(img, (cx, cy), 15, (255, 0, 255), cv2.FILLED)
        return lmList

    def findPositionWithoudId(self, img, handNo=0, draw=True):
        lmList = []
        if self.results.multi_hand_landmarks:
            myHand = self.results.multi_hand_landmarks[handNo]
            for id, lm in enumerate(myHand.landmark):
                h, w, c = img.shape
                cx, cy = int(lm.x * w), int(lm.y * h)
                lmList.append(cx)
                lmList.append(cy)
                if draw:
                    cv2.circle(img, (cx, cy), 15, (255, 0, 255), cv2.FILLED)
        return lmList

    def formatImage(self, img):
        img = Image.fromarray(img)
        contrast_enhancer = ImageEnhance.Contrast(img)
        pil_enhanced_image = contrast_enhancer.enhance(2)
        enhanced_image = np.asarray(pil_enhanced_image)
        r, g, b = cv2.split(enhanced_image)
        enhanced_image = cv2.merge([b, g, r])
        return enhanced_image

    def getNewSizes(self, img, handNo=0, draw=True):
        topPoint = 0
        leftPoint = 0
        bottomPoint = 0
        rightPoint = 0
        if self.results.multi_hand_landmarks:
            myHand = self.results.multi_hand_landmarks[handNo]
            for id, lm in enumerate(myHand.landmark):
                h, w, c = img.shape
                cx, cy = int(lm.x * w), int(lm.y * h)
                if(id == 12):
                    topPoint = cy - 20
                if(id == 0):
                    bottomPoint = cy + 20
                if(id == 20):
                    rightPoint = cx - 20
                if(id == 4):
                    leftPoint = cx + 20
        return topPoint, bottomPoint, leftPoint, rightPoint
