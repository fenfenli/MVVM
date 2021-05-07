class Observer {
  constructor(data) {
    this.observe(data);
  }

  observe(data) {
    if (!data || typeof data!=="object") {
      return;
    } else {
      Object.keys(data).forEach((key) => {
      this.observerProperty(data,key,data[key])
      this.observe(data[key])
      });
    }
  }

  observerProperty(data,key,value){
      let that = this
      let dep = new Dep()//每个变化的数据 都会对应一个数组，这个数组是存放所有更新的操作
    Object.defineProperty(data, key, {
        enumerable: true,
        configurable: true,
        get() {
            Dep.target && dep.addSub(Dep.target)
          return value;
        },
        set(newValue) {

            that.observe(newValue)
          if (newValue !== value) {
              that.observe((newValue))//如果是对象继续劫持
            value = newValue;
            dep.notify()
          }
        },
      });
  }
}


class Dep{
    constructor(){
        this.subs = []
    }

    addSub(watcher){
        this.subs.push(watcher)
    }
    notify(){
        this.subs.forEach(watcher=>watcher.update())
    }
}
