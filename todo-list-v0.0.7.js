/**
 * 한일/할일 앱
 * @version 0.0.7
 *
 * @TODO 카테고리 검색
 * @TODO 카테고리 삭제 시에... index를 따라가기 때문에.. list 삭제를 어떻게하지?
 * @TODO if로 계속 나누어서 작업해도 되는건가?
 *
 * @see https://codepen.io/NabeelMolham/pen/EjJwZP http://www.cssflow.com/snippets/simple-to-do-list
 * @see https://esdoc.org
 * @see http://babeljs.io
 */
document.addEventListener('DOMContentLoaded', () => {
  const toDoList = loadData('toDoList');
  const categoryList = loadData('category');

  // list 
  const listForm = document.getElementById('list-form');
  const toDoUl = document.createElement('ul');
  const addToDo = document.getElementById('list-add-to-do');
  const listSearchInput = document.getElementById('list-search-input');
  listForm.appendChild(toDoUl);

  // category 
  const categoryForm = document.getElementById('category-form');
  const categoryUl = document.createElement('ul');
  const categorySearchInput = document.getElementById('category-search-input');
  const addCategory = document.getElementById('category-add-to-do');
  categoryForm.appendChild(categoryUl);

  // submit 이벤트 false
  listForm.onsubmit = () => false;
  categoryForm.onsubmit = () => false;

  // + 클릭
  addToDo.addEventListener('click', () => createTodoItem());
  addCategory.addEventListener('click', () => createCategoryItem());

  // 검색어 입력 시
  listSearchInput.addEventListener('keyup', event => searchToDo(event, 'toDoList'));
  categorySearchInput.addEventListener('keyup', event => searchToDo(event, 'category'));

  // 처음 데이터 출력
  updateTodoItems(toDoList);
  updateCategory(categoryList);

  /* Data Utils */

  /**
   * 데이터 저장
   * @param {array} todoArr - 할 일 데이터
   * @param {string} listType - toDoList , category 구분
   */   
  function saveLocalStorageData(todoArr, listType) {
    const todoArrStr = JSON.stringify(todoArr);
    const setItemName = getListName(listType);   
    localStorage.setItem(setItemName, todoArrStr);
  }

  /**
   * 데이터 호출
   * @param {string} listType - toDoList , category 구분
   */  
  function loadData(listType) {
    const localGetIemName = getListName(listType);    
    const loadArrStr = localStorage.getItem(localGetIemName) || '[]';
    const loadArrPar = JSON.parse(loadArrStr);
    return loadArrPar;
  }

  /**
   * 로컬스토리지에서 사용 할 이름 출력
   * @param {string} listType - toDoList , category 구분
   */
  function getListName(listType) {
    return listType === 'toDoList' ? 'my-todo-list' : 'my-category-list';
  }

  /**
   * 데이터 마이그레이션
   * @param {string} loadedData - 마이그레이션 할 데이터
   * @param {string} listType - 리스트 타입
   * return loadedData - object 배열로 데이터 저장

  function migration(loadedData, listType) {
    // 마이그레이션이 필요한 상황
    if (loadedData.length && typeof loadedData[0] === 'string') {
      const newToDoArr = loadedData.map(value => ({ value, done: false }));
      saveData(newToDoArr, listType);
      return newToDoArr;
    }
    return loadedData;
  }
  */

  /*
  // 나중에 쓸거임
  function clearData() {
    localStorage.clear();
  }
  */

  /**
   * 배열에서 검색 값 찾기 ***작동안됨..
   * @param {string} value - 배열에서 찾을 value 값
   * @param {string} listType - 리스트 타입
   */
  function findTodoIndex(value) {
    return toDoList.findIndex(item => item.value === value);
  }

  function findCategoryIndex(value) {
    return categoryList.findIndex(item => item.value === value);
  }

  function getSelectedCategoryIndex() {
    return Array.from(categoryUl.children).findIndex(li => li.classList.value === 'selected');
  }
  
  /**
   * 데이터 수정
   * @param {object} target - 삽입, 수정 시 임시로 사용되는 input
   * @param {object} toDoLi - input, label 의 부모
   * @param {object} toDoLabel - 삽입, 수정 시 실제로 값이 들어감
   * @param {string} action - 삽입, 저장인지 확인하는 값
   * @param {string} listType - 리스트 타입
   */
  function editTodoDone({ target }, toDoLi, toDoLabel, action) {
    const { value } = target;

    switch (action) {
      case 'create': {
        // 2. 값이 있으면 저장
        if (value) {
          const category = getSelectedCategoryIndex();
          toDoList.push({ value, done: false, category });
          saveLocalStorageData(toDoList, 'toDoList');
          target.remove();
          toDoLabel.innerHTML = value;
          createRemoveIcon(toDoLi, removeIcon => deleteItem(removeIcon, 'toDoList'));
          toDoLabel.addEventListener('click', () => editTodoItem(toDoLi, toDoLabel));
        } else { // 값 없으면 인풋 지우기
          toDoLi.remove();
        }
        break;
      }

      case 'edit': {
        const { innerHTML } = toDoLabel;
        const currentItem = toDoList.find(item => item.value === innerHTML);
        const index = findTodoIndex(innerHTML);
        // 새로운 value로 배열 값 변경
        toDoList.splice(index, 1, { value, done: currentItem.done });
        saveLocalStorageData(toDoList, 'toDoList');
        target.remove();
        toDoLabel.innerHTML = value;
        break;
      }
      default: break;
    }
  }


  /**
   * 데이터 수정
   * @param {object} target - 삽입, 수정 시 임시로 사용되는 input
   * @param {object} toDoLi - input, label 의 부모
   * @param {object} toDoLabel - 삽입, 수정 시 실제로 값이 들어감
   * @param {string} action - 삽입, 저장인지 확인하는 값
   * @param {string} listType - 리스트 타입
   */
  function editCategoryDone({ target }, categoryLi, categoryLabel, action) {
    const { value } = target;

    switch (action) {
      case 'create': {
        // 2. 값이 있으면 저장
        if (value) {
          categoryList.push({ value });
          saveLocalStorageData(categoryList, 'category');
          target.remove();
          categoryLabel.innerHTML = value;
          createRemoveIcon(categoryLi, removeIcon => deleteItem(removeIcon, 'toDoList'));
          createEditIcon(categoryLi, editIcon => editTodoItem(editIcon));
          categoryLabel.addEventListener('click', () => selectCategoryItem(categoryLi, categoryLabel));
        } else { // 값 없으면 인풋 지우기
          categoryLi.remove();
        }
        break;
      }

      case 'edit': {
        const { innerHTML } = categoryLabel;
        const index = findCategoryIndex(innerHTML);
        // 새로운 value로 배열 값 변경
        categoryList.splice(index, 1, { value });
        saveLocalStorageData(categoryList, 'category');
        target.remove();
        categoryLabel.innerHTML = value;
        break;
      }
      default: break;
    }
  }

  /**
   * 체크박스 체크 확인
   * @param {string} target - 체크 확인하는 타겟
   * @param {string} listType - 리스트 타입
   */
  function changeDone({ target }) {
    const { checked, parentNode } = target;
    // 배열에서 input과 같은 것 삭제
    const { innerHTML } = Array.from(parentNode.childNodes).find(item => item.tagName === 'LABEL');
    const index = findTodoIndex(innerHTML);
    toDoList[index].done = checked;
    saveLocalStorageData(toDoList, 'toDoList');
  }

  /**
   * 아이템 삭제
   * @param {object} parentNode - 삭제하는 요소 부모
   * @param {string} listType - 리스트 타입
   */
 
  function deleteItem({ parentNode }, listType) {
    // 보이는 li 삭제
    parentNode.remove();
    
    // 배열에서 input과 같은 것 삭제
    const { innerHTML } = Array.from(parentNode.childNodes).find(item => item.tagName === 'LABEL');     
    const index = listType === 'toDoList' ? findTodoIndex(innerHTML) : findCategoryIndex(innerHTML);
    const spliceArrName = listType === 'toDoList' ? toDoList : categoryList;
    
    // 새로운 배열 localStorage 저장
    categoryList.splice(index, 1);
    saveLocalStorageData(spliceArrName, listType);
    // splice 배열 출력
    updateTodoItems(spliceArrName);
  }  

  /**
   * 삭제 아이콘 생성
   * @param {object} target - 아이콘 삽입하는 요소의 부모
   */
  /* Event Handlers */
  // 3. - 버튼 클릭
  function createRemoveIcon(target, callback) {
    /* remove 아이콘 생성 */
    const removeIcon = document.createElement('span');
    removeIcon.innerHTML = '삭제';
    removeIcon.classList.add('remove');

    // label에 remove 아이콘 삽입
    target.appendChild(removeIcon);

    // 삭제버튼 클릭
    removeIcon.addEventListener('click', () => callback(removeIcon));
  }
  
  function createEditIcon(target, callback) {
    /* remove 아이콘 생성 */
    const editIcon = document.createElement('span');
    editIcon.innerHTML = '수정';
    editIcon.classList.add('edit');

    // label에 remove 아이콘 삽입
    target.appendChild(editIcon);

    // 삭제버튼 클릭
    editIcon.addEventListener('click', () => callback(editIcon));
  }

  // 5. 비우기
  function clearList(listType) {
    const clearUl = listType === 'toDoList' ? toDoUl : categoryUl;
    clearUl.innerHTML = '';
  }

  /**
   * 검색
   * @param {object} target - 검색 인풋
   * @param {string} listType - 리스트 타입
   */
  // 검색하기
  function searchToDo({ target }) {
    const { value } = target;
    const searchValue = new RegExp(value, 'i');
    console.log('searchValue', searchValue);

    const findedData = toDoList.filter(item => item.value.match(searchValue));
    updateTodoItems(findedData);
  }

  function createCategoryItem() {
    const categoryLi = document.createElement('li');
    const categoryLabel = document.createElement('label');

    /* li에 label, input 삽입 */
    categoryLi.appendChild(categoryLabel);

    /* ul에 li 삽입 */
    categoryUl.appendChild(categoryLi);

    editCategoryItem(categoryLi, categoryLabel, 'create');
  }

  /**
   * 수정
   * @param {object} categoryLi - input, label의 부모 요소
   * @param {object} categoryLabel - 실제 값이 들어가는 요소
   * @param {string} action - 생성, 수정 구분
   */
  // 7. 수정
  function editCategoryItem(categoryLi, categoryLabel, action = 'edit') { // categoryLi, categoryLabel
    // 수정 input 추가
    const categoryValueBox = document.createElement('input');
    categoryValueBox.type = 'text';
    categoryValueBox.value = categoryLabel.innerHTML;
    categoryValueBox.classList.add('to-do-value-box');

    /* li에 삽입 */
    categoryLi.appendChild(categoryValueBox);
    categoryValueBox.focus();

    // 인풋 포커스아웃 이벤트
    categoryValueBox.addEventListener('blur', event => editCategoryDone(event, categoryLi, categoryLabel, action));
    categoryValueBox.addEventListener('keydown', event => event.keyCode === 13 && categoryValueBox.blur());
  }

  function selectCategoryItem(categoryLi) {
    Array.from(categoryUl.children).map(li => li.classList.remove('selected'));
    categoryLi.classList.add('selected');
    updateTodoItems(toDoList);
  }

  /**
   * 데이터 생성
   * @param {string} listType - 리스트 타입
   */
  // 1. 생성하기 버튼
  function createTodoItem() {
    if (categoryList.length === 0) return alert('카테고리를 먼저 생성하세요');

    const toDoLi = document.createElement('li');
    const toDoCheckbox = document.createElement('input');
    const toDoLabel = document.createElement('label');
    /**
     *  text 타입은 value 값 label에 넣기 위해서 삽입.
     * 값이 들어오면 label에 저장 후에 삭제할 것.
     */
    toDoCheckbox.type = 'checkbox';
    toDoCheckbox.classList.add('to-do-input');

    /* li에 label, input 삽입 */
    toDoLi.appendChild(toDoCheckbox);
    toDoLi.appendChild(toDoLabel);

    /* ul에 li 삽입 */
    toDoUl.appendChild(toDoLi);

    editTodoItem(toDoLi, toDoLabel, 'create');
  }

  /**
   * 수정
   * @param {object} toDoLi - input, label의 부모 요소
   * @param {object} toDoLabel - 실제 값이 들어가는 요소
   * @param {string} action - 생성, 수정 구분
   */
  // 7. 수정
  function editTodoItem(toDoLi, toDoLabel, action = 'edit') { // toDoLi, toDoLabel
    // 수정 input 추가
    const toDoValueBox = document.createElement('input');
    toDoValueBox.type = 'text';
    toDoValueBox.value = toDoLabel.innerHTML;
    toDoValueBox.classList.add('to-do-value-box');

    /* li에 삽입 */
    toDoLi.appendChild(toDoValueBox);
    toDoValueBox.focus();

    // 인풋 포커스아웃 이벤트
    toDoValueBox.addEventListener('blur', event => editTodoDone(event, toDoLi, toDoLabel, action));
    toDoValueBox.addEventListener('keydown', event => event.keyCode === 13 && toDoValueBox.blur());
  }

  function updateCategory(list) {
    clearList('category');
    for (const categoryItem of list) {
      // input, label 추가
      const categoryLi = document.createElement('li');
      const categoryLabel = document.createElement('label');

      /* li에 label, input 삽입 */
      categoryLi.appendChild(categoryLabel);

      /* ul에 li 삽입 */
      categoryUl.appendChild(categoryLi);

      /* 값 삽입 */
      categoryLabel.innerHTML = categoryItem.value;
      createRemoveIcon(categoryLi, removeIcon => deleteItem(removeIcon, 'category'));
      createEditIcon(categoryLi, editIcon => editCategoryItem(categoryLi, categoryLabel));
      
      // label 클릭 시
      // categoryLabel.addEventListener('click', () => editCategoryItem(categoryLi, categoryLabel));
      categoryLi.addEventListener('click', () => selectCategoryItem(categoryLi, categoryLabel));
    }
    categoryForm.appendChild(categoryUl);
    
    // update시에 처음 li 항상 클릭
    if (categoryUl.childElementCount >= 1) {
      const firstCategoryLi = categoryUl.children[0];
      firstCategoryLi.click();
    }
    
  }

  /**
   * 출력
   * @param {object} todoList - 출력할 배열
   * @param {string} listType - 리스트 타입
   */
  // 4. 입력된 값 출력
  function updateTodoItems(list) {
    clearList('toDoList');
    const category = getSelectedCategoryIndex();

    for (const todoItem of list) {
      if (todoItem.category !== category) continue;

      // input, label 추가
      const toDoLi = document.createElement('li');
      const toDoCheckbox = document.createElement('input');
      const toDoLabel = document.createElement('label');

      toDoCheckbox.type = 'checkbox';
      toDoCheckbox.classList.add('to-do-input');

      /* li에 label, input 삽입 */
      toDoLi.appendChild(toDoCheckbox);
      toDoLi.appendChild(toDoLabel);

      /* ul에 li 삽입 */
      toDoUl.appendChild(toDoLi);

      /* 값 삽입 */
      toDoLabel.innerHTML = todoItem.value;
      toDoCheckbox.checked = todoItem.done;
      createRemoveIcon(toDoLi, removeIcon => deleteItem(removeIcon, 'toDoList'));
      
      // label 클릭 시
      toDoLabel.addEventListener('click', () => editTodoItem(toDoLi, toDoLabel));
      // checkbox 클릭 시
      toDoCheckbox.addEventListener('click', event => changeDone(event));
    }
  }

  // const submitBtn = document.getElementById('submit-btn');
});
