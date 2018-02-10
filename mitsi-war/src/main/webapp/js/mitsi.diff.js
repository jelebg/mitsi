function distinctList(arr, f) {
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
    return a;
}

