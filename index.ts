import { interval, Subject, BehaviorSubject } from 'rxjs';
import { filter, multicast, refCount, tap } from 'rxjs/operators';

//emit value in sequence every 1 second
// const source = interval(1000);
//output: 0,1,2,3,4,5....
// const subscribe = source.subscribe(val => console.log(val));

// setTimeout(() => subscribe.unsubscribe(), 10 * 1000);

declare global {
  // tslint:disable-next-line: interface-name
  interface Window {
    publish: any;
    t: any;
  }
}

const publish = new Subject();

window.publish = publish;

let index = 0;
const msgT = setInterval(() => {
  console.log(`> ${index}`);
  publish.next(index++);
}, 1000);

const get = (v) => publish.pipe(
  filter((msg: number) => {
    return msg % v === 0;
  }),
  multicast(new Subject()),
  refCount(),
);

class Test {
  bs = new BehaviorSubject(undefined)
  g2 = null
  g02 = null

  s1 = null
  s2 = null

  init() {
    this.g02 = get(2);
    this.g2 = this.g02.pipe(
      tap((v) => {
        console.log(`g2 tap ${v}`)
        this.bs.next((bsv) => console.log(`bsv ${bsv}`))
      })
    );

    console.log(`this.g02 === this.g2 : ${this.g02 === this.g2}`);

    this.s1 = this.g2.subscribe();

    this.s2 = this.bs.subscribe({
      next: (fn) => {
        if (fn) {
          fn('test');
        }
      }
    });
  }

  destroy() {
    this.s1.unsubscribe();
    this.s2.unsubscribe();
    console.log(this.s1, this.s2, this.g02, this.g2);
  }
}

const t = new Test();
window.t = t;
t.init();

setTimeout(() => {
  t.destroy();
}, 10 * 1000)

setTimeout(() => {
  const g22 = get(2).subscribe(
    (v) => console.log(`+++ g2 ${v}`)
  )
  console.log(g22, publish);

  setTimeout(() => g22.unsubscribe(), 5 * 1000);

  setTimeout(() => clearInterval(msgT), 8 * 1000);

}, 15 * 1000)

