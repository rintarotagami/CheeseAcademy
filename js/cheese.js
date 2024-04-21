var cheese = document.getElementById('cheese-wrapper');

window.addEventListener('scroll', function() {
    var cheesePosition = cheese.getBoundingClientRect().top;
    var screenPosition = window.innerHeight;
    if(cheesePosition < screenPosition){
        cheese.classList.toggle('switch');
    }
});
