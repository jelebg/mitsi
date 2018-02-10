function distinctList(arr, f, notAllEquals) {
    if (!f) {
        f = function(x) { return x; };
    }

    let u = {};
    let a = [];
    for(let i = 0, l = arr.length; i < l; ++i){
        let v = f(arr[i]);
        if(!u.hasOwnProperty(v)) {
            a.push(v);
            u[v] = 1;
        }
    }

    if (notAllEquals) {
        notAllEquals.f = (a.length > 1);
    }

    return a;
}

