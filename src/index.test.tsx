import enzymeAdapterPlusnew, { mount } from 'enzyme-adapter-plusnew';
import { configure } from 'enzyme';
import plusnew, { component } from 'plusnew';
import dndFactory from './index';

configure({ adapter: new enzymeAdapterPlusnew() });

describe('test dragFactory', () => {
  it('dragState is shown correctly', () => {
    const drag = dndFactory();
    const MainComponent = component(
      'MainComponent',
      () => <drag.Component>{dragState => <span>{dragState.active ? 'active' : 'notactive'}</span>}</drag.Component>,
    );

    const wrapper = mount(<MainComponent />)

    expect(wrapper.containsMatchingElement(<span>notactive</span>)).toBe(true);

    drag.store.dispatch({
      type: 'DRAG_START',
      data: {
        position: {
          x: 10,
          y: 20
        },
        payload: {}
      }
    });

    expect(wrapper.containsMatchingElement(<span>active</span>)).toBe(true);
  });

  it('dragState carries payload', () => {
    const drag = dndFactory<{id: number}>();
    const MainComponent = component(
      'MainComponent',
      () => <drag.Component>{dragState => <span>{dragState.active  ? dragState.payload.id : 'notactive'}</span>}</drag.Component>,
    );

    const wrapper = mount(<MainComponent />)

    expect(wrapper.containsMatchingElement(<span>notactive</span>)).toBe(true);

    drag.store.dispatch({
      type: 'DRAG_START',
      data: {
        position: {
          x: 10,
          y: 20
        },
        payload: {
          id: 23
        }
      }
    });

    expect(wrapper.containsMatchingElement(<span>{23}</span>)).toBe(true);
  });

  it('delta position gets carried', () => {
    const onDropSpy = jasmine.createSpy('onDrop');

    const drag = dndFactory();
    const MainComponent = component(
      'MainComponent',
      () => <drag.Component onDrop={onDropSpy}>{dragState => <span>{dragState.active ? dragState.deltaPosition.x : 'notactive'}</span>}</drag.Component>,
    );

    const wrapper = mount(<MainComponent />)

    expect(wrapper.containsMatchingElement(<span>notactive</span>)).toBe(true);

    drag.store.dispatch({
      type: 'DRAG_START',
      data: {
        position: {
          x: 10,
          y: 20
        },
        payload: {}
      }
    });

    expect(wrapper.containsMatchingElement(<span>{0}</span>)).toBe(true);

    drag.store.dispatch({
      type: 'DRAG_MOVE',
      data: {
        position: {
          x: 15,
          y: 25,
        }
      }
    });

    expect(wrapper.containsMatchingElement(<span>{5}</span>)).toBe(true);
    expect(onDropSpy.calls.count()).toBe(0)

    drag.store.dispatch({
      type: 'DRAG_STOP',
    });

    expect(wrapper.containsMatchingElement(<span>notactive</span>)).toBe(true);
    expect(onDropSpy.calls.count()).toBe(1);
  });

  it('render props just gets called initially, not on inactive state', () => {
    const renderProps = jasmine.createSpy('onDrop', (dragState) => <span>{dragState.active ? 'active' : 'notactive'}</span>).and.callThrough();

    const drag = dndFactory();
    const MainComponent = component(
      'MainComponent',
      () => <drag.Component>{renderProps}</drag.Component>,
    );

    const wrapper = mount(<MainComponent />)

    expect(wrapper.containsMatchingElement(<span>notactive</span>)).toBe(true);
    expect(renderProps.calls.count()).toBe(1);

    drag.store.dispatch({
      type: 'DRAG_MOVE',
      data: {
        position: {
          x: 15,
          y: 25,
        }
      }
    });

    expect(renderProps.calls.count()).toBe(1);
  });

  it('store throws exception with invalid action', () => {
    const drag = dndFactory();

    expect(() => {
      drag.store.dispatch('no read action' as any);
    }).toThrowError('No Such Action');
  })
});
