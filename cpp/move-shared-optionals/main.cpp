
/**
 * @file main.cpp
 * @author remolueoend
 * @brief Playing around with move-constructors/-assignments, shared_ptrs, and optionals by implementing a basic linked list.
 * @version 0.1
 * @date 2022-05-25
 *
 * @copyright Copyright (c) 2022
 *
 */

#include <iostream>
#include <memory>
#include <vector>
#include <string>
#include <assert.h>
#include <cstring>
#include <optional>

using namespace std;

/**
 * @brief Sample class overriding copy/move constructors and assignment operators for testing.
 *
 */
class A
{
private:
	string ident;

public:
	// parametrized constructor
	A(string ident) : ident(ident)
	{
		printf("[CALL] A[%s]::CTOR\n", ident.c_str());
	}

	/**
	 * @brief copy-constructor
	 * @example
	 * ```cpp
	 * A a1;
	 * A a2 = a1; // copy
	 * ```
	 */
	A(const A &other)
	noexcept
	{
		ident = other.ident + ".cop-ctor";
		printf("[CALL] A[%s]::COPY CTOR from %s\n", ident.c_str(), other.ident.c_str());
	}

	/**
	 * @brief move-constructor
	 * @example
	 * ```cpp
	 * A a1;
	 * A a2 = a1; // move
	 * ```
	 */
	A(A &&other)
	noexcept // does not work without it, at least with gcc
	{
		ident = other.ident + ".mov-ctor";
		printf("[CALL] A[%s]::MOV CTOR from %s\n", ident.c_str(), other.ident.c_str());
		other.ident += ".moved";
	}

	/**
	 * @brief copy-assignment
	 * @example
	 * ```cpp
	 * A a1, a2;
	 * a2 = a1; // copy
	 * ```
	 */
	A &operator=(const A &other) noexcept
	{
		ident = other.ident + ".cop-ass";
		printf("[CALL] A[%s]::COPY OP from %s\n", ident.c_str(), other.ident.c_str());

		return *this;
	}

	/**
	 * @brief move-assignment
	 * @example
	 * ```cpp
	 * A a1, a2;
	 * a2 = a1; // move
	 * ```
	 */
	A &operator=(A &&other) noexcept // does not work without it, at least with gcc
	{
		ident = other.ident + ".mov-ass";
		printf("[CALL] A[%s]::MOV OP from %s\n", ident.c_str(), other.ident.c_str());
		other.ident += ".moved";

		return *this;
	}

	~A()
	{
		printf("[CALL] A[%s]::~DESTR\n", ident.c_str());
	}

	string identifier()
	{
		return ident;
	}
};

template <class T>
class LinkedList
{
private:
	class Node
	{
	private:
		// Node owns the wrapped value: If the node gets destructed, so is its value.
		T _value;

	public:
		std::optional<shared_ptr<Node>> next;

		Node(T value) : _value(move(value)) {}
		// do not allow copying nodes:
		Node(const Node &) = delete;
		Node &operator=(const Node &other) = delete;

		T *value() { return &_value; }

		~Node()
		{
			printf("[CALL] Node::~DESTR\n");
		}
	};

	// a pointer to a node is generally shared, e.g. from preceeding node (via `next`),
	// _begin and _end from a list, etc.
	using NodePtr = shared_ptr<Node>;

	/**
	 * @brief Provides a set of methods for list iterations.
	 * All methods start from the given Node pointer.
	 *
	 */
	class Iterator
	{
	private:
		std::optional<NodePtr> _init;
		std::optional<NodePtr> _curr;

	public:
		Iterator(std::optional<NodePtr> node) : _curr({node}) {}

		bool has_next()
		{
			return _curr != std::nullopt;
		}

		T *next()
		{
			auto result = *_curr;
			_curr = (*_curr)->next;
			return result->value();
		}

		void for_each(void (*f)(T *))
		{
			while (has_next())
			{
				f(next());
			}
		}

		template <class U>
		LinkedList<U> map(U (*f)(T *))
		{
			LinkedList<U> new_list;
			while (has_next())
			{
				new_list.push(f(next()));
			}

			return new_list;
		}

		void reset()
		{
			_curr = _init;
		}
	};

	typedef struct pointers_t
	{
		NodePtr begin;
		NodePtr end;
	} pointers_t;

	// LinkedList members
	size_t _len;
	std::optional<pointers_t> _ptrs = nullopt;

public:
	LinkedList() : _len(0) {}

	size_t len()
	{
		return _len;
	}

	void push(T value)
	{
		// move the given value into the node:
		auto new_node_ptr = make_shared<Node>(move(value));
		if (_ptrs) // is true if _ptrs != nullopt
		{
			// use -> to access wrapped value of optionals:
			_ptrs->end->next = {new_node_ptr};
			_ptrs->end = {new_node_ptr};
		}
		else
		{
			_ptrs = {
				.begin = {new_node_ptr},
				.end = {new_node_ptr},
			};
		}
		_len++;
	}

	/**
	 * @brief Pops from the beginning of the list.
	 * The ownership of the returned value is transferred to the caller.
	 */
	T pop()
	{
		assert(_ptrs != nullopt && "cannot pop, list is empty");
		// move value out of node:
		T val = move(*_ptrs->begin->value());
		if (_len == 1)
		{
			_ptrs = nullopt;
		}
		else
		{
			_ptrs->begin = *_ptrs->begin->next;
		}

		_len--;
		return val;
	}

	size_t size()
	{
		return _len;
	}

	Iterator iter()
	{
		return Iterator(_ptrs ? make_optional<NodePtr>(_ptrs->begin) : nullopt);
	}
};

LinkedList<A> bar()
{
	LinkedList<A> l;

	l.push(A("a0"));
	l.push(A("a1"));
	l.push(A("a2"));

	A a3("a3");
	l.push(move(a3));

	A a0 = l.pop();

	auto l2 = l.iter().map<A>([](A *v)
							  { return A(v->identifier() + ".NEW"); });

	l2.iter().for_each([](A *v)
					   { printf("IDENT: %s\n", v->identifier().c_str()); });

	printf("END BAR\n");
	return l2;
}

void foo()
{
	printf("START FOO\n");
	auto list = bar();
	printf("END FOO\n");
}

void foo2(A &a)
{
	printf("START FOO3\n");
	LinkedList<A *> l;
	l.push(&a);
	printf("END FOO2\n");
}

void foo3()
{
	printf("START FOO3\n");
	typedef struct data_t
	{
		int foo;
	} data_t;
	LinkedList<data_t> l;

	l.push({.foo = 5});

	printf("END FOO3\n");
}

void foo4()
{
	printf("START FOO4\n");
	LinkedList<A> l;
	l.push(A("a20"));
	A a20 = l.pop();
	printf("END FOO4\n");
}

int main()
{
	printf("BEFORE FOO\n");
	foo();
	printf("AFTER FOO\n");

	A a10("a10");
	printf("BEFORE FOO2\n");
	foo2(a10);
	printf("AFTER FOO2\n");

	printf("BEFORE FOO3\n");
	foo3();
	printf("AFTER FOO3\n");

	printf("BEFORE FOO4\n");
	foo4();
	printf("AFTER FOO4\n");

	return 0;
}
