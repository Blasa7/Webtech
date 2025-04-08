Group 49
Made by: Floris de Gruijter, Abracha Koens, Nicolas Penders
Link: http://webtech.science.uu.nl/group49/login.html

Description:
The website is structure with all the server side code in the app.js.
This includes database creation, filling with dummy values, sql queries and http methods.
For most pages ejs was used as scripting language. The views are located in the views folder and rendered
through res.render(*.ejs) when requested. Required parameters are passed when rendered. 
The login and register pages are not rendered with a scripting language and are located in public/html.
Html in combination with dom manipulation in js was used. All client side scripting files can be found in 
public/js. Every page has a accompanying js file with the same name ending in .js instead of .ejs or .html. 
The views are not in the public folder since they don't need to be served to the client.
Ajax was used in a number of places namely: The loading of students for a course, the loading of images 
from the database and the logout button. A library was used for common code located in public/js/lib.js. 
This file contains the classes used for students courses and programs as well as the shared html elements
between pages such as the header, footer and navigation elements. 

The general layout of the page is a profile page where users can edit their own profile, a course overview were user 
can view courses they participate in, by clicking on the header of a course it expands to show all participating students. 
Here you can also send and accept friend request from other users. Next there is a page to view your current friends. 
There are two option, one opens your friend student profile, the other opens up a chat with your friend. 
Note: to receive new incoming messages the page needs to be refreshed but to see your outgoing messages is instant!
There is a logout button in the footer that ends your session and takes you back to the login screen.

All users are created somewhat randomly on database creation. For convenience the password and username of
all randomly generated users is the same. The usernames can be found in app.js on line 177. 

The create table statements for the database are best viewed directly in app.js between line 20 and 83.
Foreign keys are used when referring to different tables. Attributes such as not null and defaults are
also used where logical.
