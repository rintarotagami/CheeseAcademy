var
    timer = 2000,
    cheese = document.getElementById('cheese-wrapper');

setInterval(function () {
    cheese.classList.toggle('switch');
}, timer);

