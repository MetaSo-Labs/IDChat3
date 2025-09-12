// EventBus.ts

type Callback<T> = (data: T) => void;

interface Listeners<T> {
  [eventName: string]: Callback<T>[];
}

export class EventBus<T> {
  private listeners: Listeners<T> = {};

  //   public subscribe(eventName: string, callback: Callback<T>): () => void {
  //     if (!this.listeners[eventName]) {
  //       this.listeners[eventName] = [];
  //     }
  //     this.listeners[eventName].push(callback);
  //     return () => {
  //       this.unsubscribe(eventName, callback);
  //     };
  //   }

  public subscribe(eventName: string, callback: Callback<T>): () => void {
    
    // 取消之前的订阅
    this.unsubscribe(eventName, callback);

    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    // 检查是否已经订阅过，避免重复订阅
    if (this.listeners[eventName].indexOf(callback) === -1) {
      this.listeners[eventName].push(callback);
    }
    return () => {
      this.unsubscribe(eventName, callback);
    };
  }

  public unsubscribe(eventName: string, callback: Callback<T>): void {
    const eventListeners = this.listeners[eventName];
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index !== -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  public publish(eventName: string, data: T): void {
    console.log("publish", eventName, data);

    const eventListeners = this.listeners[eventName];
    if (eventListeners) {
      eventListeners.forEach((callback) => callback(data));
    }
  }
}

//类似 any
export class MessageData {
  data: string;
}
export const eventBus = new EventBus<MessageData>();
//events
export const refreshMvcFtEvent = "refreshMvcFtEvent";
export const refreshBtcFtEvent = "refreshBtcFtEvent";
export const refreshHomeLoadingEvent = "refreshHomeLoadingEvent";




export const loginSuccess_Bus="loginSuccess_Bus";
export const logout_Bus="logout_Bus";



//指定类型
export class Mydata {
  data: string;
}
export const myDataEventBus = new EventBus<Mydata>();
