import warnings
import HandTrackingModule as htm
import cv2

def warn(*args, **kwargs):
    pass
warnings.warn = warn

detector = htm.handDetector()
cap = cv2.VideoCapture(0)

while True:
    success, img = cap.read()
    img = detector.findHands(img, draw=True)
    img = cv2.flip(img, 1)
    k = cv2.waitKey(1)

    if k % 256 == 27:
        break
    cv2.imshow("Image", img)

cap.release()
cv2.destroyAllWindows()
