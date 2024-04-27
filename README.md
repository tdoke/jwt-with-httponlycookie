1] storing jwt in session or local storage.</br>
   Never put sensitive information in session/local storage. Third pary javascript can access
   session/local storage very easily.</br>
2] storing jwt in http only cookies</br>
   This is better way of storing jwts as</br> 
    2.1] httponly cookies cannot be accessed by browser javascript.</br>
    2.2] by default httponly cookie will be sent along with each http request.</br>
3] pros, cons and alternatives of jwt
