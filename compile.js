class Compile {
  constructor(el, vm) {
    this.el = this.isNode(el) ? el : document.querySelector(el);
    this.vm = vm;

    if (this.el) {
      let fragment = document.createDocumentFragment();
      Array.from(this.el.childNodes).forEach((node) => {
        fragment.append(node);
      });

      this.handleCompile(fragment);

      this.el.appendChild(fragment);
    }
  }
  //辅助方法
  isNode(node) {
    return node.nodeType === 1;
  }
  handleCompileElement(node) {
    Array.from(node.attributes).forEach((attr) => {
      if (attr.name.includes("v-")) {
        let expr = attr.value;
        let [, type] = attr.name.split("-");
        this.CompileUtil[type](node, this.vm, expr);
      }
    });
  }

  handleCompileText(node) {
    let text = node.textContent;
    let reg = /\{\{([^}]+)\}\}/g;
    if (reg.test(text)) {
      this.CompileUtil["text"](node, this.vm, text);
    }
  }
  //核心方法
  handleCompile(fragment) {
    Array.from(fragment.childNodes).forEach((node) => {
      if (this.isNode(node)) {
        //元素节点
        this.handleCompileElement(node);
        this.handleCompile(node);
      } else {
        //文本节点
        console.log(node)
        this.handleCompileText(node);
      }
    });
  }

  CompileUtil = {
    setVal(vm,expr,value){
      expr= expr.split('.');
      return expr.reduce((prev,next,currentIndex)=>{
        if(currentIndex === expr.length-1){
          return prev[next] = value
        }
        return prev[next]
      },vm.$data)
    },
    getVal(vm, expr) {
      expr = expr.split(".");
      return expr.reduce((prev, next) => {
        return prev[next];
      }, vm.$data);
    },

    getTextVal(vm, expr) {
      let that = this;
      return expr.replace(/\{\{([^}]+)\}\}/g, (...v) => {
        
        return that.getVal(vm, v[1]);
      });
    },
    text(node, vm, expr) {
      let updateFn = this.updater.textUpdater;

      expr.replace(/\{\{([^}]+)\}\}/g, (...v) => {
        new Watcher(vm,v[1],(newValue)=>{
            updateFn && updateFn(node, newValue);
        })
      });

      updateFn && updateFn(node, this.getTextVal(vm, expr))
    }, //文本处理
    model(node, vm, expr) {
      //输入框处理
      let updateFn = this.updater.modelUpdater

      new Watcher(vm,expr,(newValue)=>{
        //添加一个观察者，当值发生变化后，将新值传递过来
        updateFn && updateFn(node, newValue);
      })
      node.addEventListener('input',(e)=>{
        let newValue = e.target.value;
        this.setVal(vm,expr,newValue)
      })
      updateFn && updateFn(node, this.getVal(vm, expr));
    },
    updater: {
      textUpdater(node, value) {
        node.textContent = value;
      },
      modelUpdater(node, value) {
        node.value = value;
      },
    },
  };
}
