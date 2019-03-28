import plusnew, { store, Component, ApplicationElement, Props } from 'plusnew';

type position = {
  x: number;
  y: number;
};

type dragState<T> = dragInactive | dragActive<T>;

type dragInactive = {
  active: false;
};

type dragActive<T> = {
  active: true,
} & dragInformation<T>;

type dragInformation<T> = {
  startPosition: position;
  currentPosition: position;
  deltaPosition: position;
  payload: T;
};

type dragProps<T> = {
  onDrop?: (dragState: dragInformation<T>) => void;
  children: (dragState: dragState<T>) => ApplicationElement;
};

type dragStartAction<T> = {
  type: 'DRAG_START',
  data: {
    position: position,
    payload: T,
  },
};

type dragMoveAction = {
  type: 'DRAG_MOVE',
  data: {
    position: position,
  },
};

type dragStopAction = {
  type: 'DRAG_STOP',
};

type actions<T> = dragStartAction<T> | dragMoveAction | dragStopAction;

function getDeltaPosition(from: position, to: position) {
  return {
    x: to.x - from.x,
    y: to.y - from.y,
  };
}

function renderProps<T>(props: T): T {
  return (props as any)[0];
}

export default function <T>() {
  const inactiveDrag: dragState<T> = { active: false };
  const dragStore = store(inactiveDrag as dragState<T>, (state, action: actions<T>) => {
    switch (action.type) {
      case 'DRAG_START': {
        const result: dragActive<T> = {
          active: true,
          payload: action.data.payload,
          startPosition: action.data.position,
          currentPosition: action.data.position,
          deltaPosition: {
            x: 0,
            y: 0,
          },
        };

        return result;
      }

      case 'DRAG_MOVE': {
        if (state.active) {
          const result: dragActive<T> = {
            active: true,
            payload: state.payload,
            startPosition: state.startPosition,
            currentPosition: action.data.position,
            deltaPosition: getDeltaPosition(state.startPosition, action.data.position),
          };

          return result;
        }
        return state;
      }

      case 'DRAG_STOP': {
        return inactiveDrag;
      }
    }

    throw new Error('No Such Action');
  });

  class DragComponent extends Component<dragProps<T>> {
    render(Props: Props<dragProps<T>>) {
      let initialRender = true;
      let dragStateCache: dragActive<T>;

      return <dragStore.Observer>{(dragState) => {
        if (dragState.active === true) {
          dragStateCache = dragState;
        } else if (initialRender === false) {
          const props = Props.getState();
          if (props.onDrop) {
            props.onDrop(dragStateCache);
          }
        }

        if (initialRender) {
          initialRender = false;
        }
        return (
          <Props>{(props) => {
            return renderProps(props.children)(dragState);
          }}</Props>
        );
      }}</dragStore.Observer>;
    }
  }
  return {
    Component: DragComponent,
    store: dragStore,
  };
}
