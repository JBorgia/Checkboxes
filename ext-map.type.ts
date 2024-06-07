export class ExtMap<T> extends Map<string, T> {
  concat(additionalExtMap: ExtMap<T>) {
    const map = new ExtMap<T>(this);
    [...additionalExtMap].forEach(([id, jep]) => {
      if (this.has(id)) {
        throw new Error(
          'Each element must have a unique id. Found ' + id + ' more than once.'
        );
      } else {
        map.set(id, jep);
      }
    });
    return map;
  }
  map<R>(callbackfn: (id: string, value: T, index: number) => R) {
    const map = new ExtMap<R>();
    [...this.entries()].forEach(([id, value], idx: number) => {
      map.set(id, callbackfn(id, value, idx));
    });
    return map;
  }
  filter(callbackfn: (key: string, value: T, index: number) => boolean) {
    const map = new ExtMap<T>();
    [...this.entries()].forEach(([key, value], idx: number) => {
      if (callbackfn(key, value, idx)) {
        map.set(key, value);
      }
    });
    return map;
  }
  sort(callbackfn: (a: [string, T], b: [string, T]) => number) {
    const sortedMap = new ExtMap<T>([...this.entries()].sort(callbackfn));
    return sortedMap;
  }
}
