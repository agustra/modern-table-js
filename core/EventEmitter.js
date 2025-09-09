/**
 * EventEmitter - Modern event system for ModernTable.js
 */
export class EventEmitter {
    constructor() {
        this.events = new Map();
    }

    /**
     * Add event listener
     */
    on(event, callback) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event).push(callback);
        return this;
    }

    /**
     * Remove event listener
     */
    off(event, callback) {
        if (!this.events.has(event)) return this;
        
        const callbacks = this.events.get(event);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
            callbacks.splice(index, 1);
        }
        return this;
    }

    /**
     * Emit event
     */
    emit(event, ...args) {
        if (!this.events.has(event)) return this;
        
        this.events.get(event).forEach(callback => {
            try {
                callback(...args);
            } catch (error) {
                console.error(`Error in event listener for '${event}':`, error);
            }
        });
        return this;
    }

    /**
     * Add one-time event listener
     */
    once(event, callback) {
        const onceCallback = (...args) => {
            callback(...args);
            this.off(event, onceCallback);
        };
        return this.on(event, onceCallback);
    }

    /**
     * Remove all listeners for event
     */
    removeAllListeners(event) {
        if (event) {
            this.events.delete(event);
        } else {
            this.events.clear();
        }
        return this;
    }
}