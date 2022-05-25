#include <iostream>
#include "Eigen/Dense"

int main(int, char **)
{
    using namespace Eigen;
    using namespace std;

    VectorXcd v(2);
    v(0) = complex(3., 5.);
    v(1) = complex(1., 5.);

    VectorXi u(2);
    u << 1, 2;
    u.col(0).setZero()

    VectorXcd u_cmplx = u.cast<complex<double>>();
    complex<double> w = u_cmplx.dot(v);

    cout << "the dot product of u and v is: " << w << endl;
}
