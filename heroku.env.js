// This script lets you export all heroku config vars
// 1) Go to your app settings and reveal config vars
// 2) Open the console and run this code:
// BONUS: You can add this script as a bookmark.

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
  }
  
  var env = ''
  Array.from(document.getElementsByTagName('tbody')[0].children).map(item => env += item.children[0].children[0].value + '=' + item.children[1].children[0].value + '\n')
  download('env.txt', env);