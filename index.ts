import { interval, Subject, BehaviorSubject } from 'rxjs';
import { filter, multicast, refCount, tap } from 'rxjs/operators';

//emit value in sequence every 1 second
const source = interval(1000);
//output: 0,1,2,3,4,5....
const subscribe = source.subscribe(val => console.log(val));

// setTimeout(() => subscribe.unsubscribe(), 10 * 1000);


const publish = new Subject();

source.subscribe((val) => publish.next(val));

const get = (v) => publish.pipe(
  filter((msg: number) => {
    return msg % v === 0;
  }),
  multicast(new Subject()),
  refCount(),
);

const bs = new BehaviorSubject(undefined);

const t = tap((v) => {
  console.log(`g2 tap ${v}`)
  bs.next((bsv) => console.log(`bsv ${bsv}`, bs))
  return (s) => {
    console.log('unscribe~', s)
  }
})

const g2 = get(2).pipe(
  t
).subscribe();

setTimeout(() => {
  bs.subscribe({
    next: (fn) => {
      if (fn) {
        fn();
      }
    }
  })
}, 10)


setTimeout(() => g2.unsubscribe(), 10 * 1000)

setTimeout(() => {
  get(2).subscribe(
    (v) => console.log(`+++ g2 ${v}`)
  )
  console.log(t)
  subscribe.unsubscribe()
}, 15 * 1000)

