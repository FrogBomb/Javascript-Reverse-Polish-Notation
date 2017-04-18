function gen_rpn_interpreter(op_keys, data_translator, sep = " "){
    //op_keys := {op_key : (function(data_type) -> data_type)}
    //      Object containing keys to functions that operate on data.
    //data_translator := String -> data_type
    //      Function to translate non-operational symbols to data.
    //sep := String
    //      Symbol separator (default is a space := " ")
    //<return> := String -> data_type
    //      A Reverse Polish Notation interpreter. Takes a string
    //      and computes the output.
    
    
    // Changes a function on data_types into an in-place stack function.
    // Symbolically, this cna be interpreted as:
    // stack_fun := (fun := (data_type[fun.length] -> data_type)) ->
    //       (arg_stack := [data_type] -> None)
    //
    // where arg_stack <-
    //      fun(arg_stack to fun.length) concat (arg_stack from fun.length)
    //
    function stack_fun(fun){
        return function(arg_stack){
            arg_stack.unshift(fun.apply(this, arg_stack.splice(0, fun.length)));
        }
    }
    
    //symbol cleaner (Avoid input name collision...)
    function sym_cleaner(symbol){
        var k = {};
        if(k[symbol]){
            return undefined;
        }else{
            return symbol;
        }
    }
    
    //The returned interpreter.
    function rpn_intr(inString){
        let stack = []; //[data_type]
        //e.g. inString := "4 1 5 + 3 - *"
        //could go through the following steps:
        // 4 1 5 + 3 - * =>
        // 4 6 3 - * =>
        // 4 3 * =>
        // 12
        let inputs = inString.split(sep)
        for (i in inputs){
            let cur_symbol = sym_cleaner(inputs[i]);
            let cur_op = op_keys[cur_symbol];
            if(cur_op === undefined){
                stack.unshift(data_translator(cur_symbol));
            }else{
                stack_fun(cur_op)(stack);
            }
        }
        return stack[0];
    }
    
    return rpn_intr;
}
function simple_test(){
    let simple_rpn_ops = {
        "+": function(a, b){ return a + b },
        "*": function(a, b){ return a * b }, 
        //Note the order! First = closest to operator
        "-": function(a, b){ return b - a },
        //Can also take different number of args
        "neg": function(a) { return -a },
        //Add side-effects
        "print": function(a) { console.log(a); return a }
    };
    let simple_data_trans = function(in_string){
        return parseInt(in_string)
    };
    
    //Just using the default separator, which is a single space!
    let simple_rpn = gen_rpn_interpreter(simple_rpn_ops, simple_data_trans);
    
    simple_rpn("4 1 5 + 3 - * print 3 neg + print");
    console.log("Just printed 12 then 9!")
    
    return simple_rpn
}
